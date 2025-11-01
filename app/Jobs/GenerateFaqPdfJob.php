<?php

namespace App\Jobs;

use App\Models\Faq;
use App\Models\FaqExport;

use App\Services\LangService;
use App\Services\LoggerService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\View;
use iio\libmergepdf\Merger;
use iio\libmergepdf\Driver\TcpdiDriver;
use Mpdf\Mpdf;
use Mpdf\Output\Destination;

class GenerateFaqPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int    $exportId,
        public int    $langId,
        public string $language,
        public ?int   $categoryId = null,
        public int    $chunkSize = 1000,
    )
    {
    }

    public function handle(): void
    {
        $export = FaqExport::query()->find($this->exportId);

        if (!$export) {
            LoggerService::instance()->log('GenerateFaqPdfJob: Export record not found, ID: ' . $this->exportId);
            return;
        }

        $export->update(['status' => 'processing']);

        ini_set('memory_limit', '1024M');
        set_time_limit(0);

        $tmpDir = storage_path('app/reports/tmp_' . uniqid());
        if (!is_dir($tmpDir)) mkdir($tmpDir, 0775, true);

        $categoryId = $this->categoryId;

        $query = Faq::query()
            ->active()
            ->when($categoryId, function (Builder $builder) use ($categoryId) {
                $builder->where(function (Builder $query) use ($categoryId) {
                    $query->whereHas('categories', function (Builder $q) use ($categoryId) {
                        $q->where('categories.id', $categoryId);
                    });
                    $query->orWhereHas('categories', function (Builder $q) use ($categoryId) {
                        $q->where('categories.category_id', $categoryId);
                    });
                });
            })
            ->with([
                'translatable',
            ])
            ->orderByDesc('id');

        $part = 0;

        $messages = [
            'part' => LangService::instance()
                ->setDefault('Part')
                ->getLang('faqs_pdf_part', [], $this->langId),
            'title' => LangService::instance()
                ->setDefault('FAQ support - All questions and answers')
                ->getLang('faqs_pdf_title', [], $this->langId),
            'heading' => LangService::instance()
                ->setDefault('FAQ support system')
                ->getLang('faqs_pdf_heading', [], $this->langId),
            'description' => LangService::instance()
                ->setDefault('All questions and answers')
                ->getLang('faqs_pdf_description', [], $this->langId),
            'export_date' => LangService::instance()
                ->setDefault('Export date: @date')
                ->getLang('faqs_pdf_export_date', [
                    '@date' => Carbon::now()->toDateTimeString(),
                ], $this->langId),
            'questions' => LangService::instance()
                ->setDefault('Questions')
                ->getLang('faqs_pdf_question', [], $this->langId),
            'created_date' => LangService::instance()
                ->setDefault('Created date')
                ->getLang('faqs_pdf_created_date', [], $this->langId),
            'updated_date' => LangService::instance()
                ->setDefault('Updated date')
                ->getLang('faqs_pdf_updated_date', [], $this->langId),
        ];

        $query->chunkById($this->chunkSize, function ($faqs) use (&$part, $tmpDir, $messages) {
            $part++;

            $faqs->transform(function (Faq $faq) {
                $faq->question = $faq->getLang('question', $this->langId);
                $faq->answer = $faq->getLang('answer', $this->langId);

                return $faq->setRelations([]);
            });

            $html = View::make('faqs.faqs-pdf', [
                'faqs' => $faqs,
                'part' => $part,
                'index_start' => ($part - 1) * $this->chunkSize + 1,
                'language' => $this->language,
                'messages' => $messages,
            ])->render();

            $pdfPath = "$tmpDir/part-$part.pdf";

            $mpdf = new Mpdf([
                'format' => 'A4',
                'tempDir' => storage_path('app/mpdf-temp'),
                'margin_left' => 8,
                'margin_right' => 8,
                'margin_top' => 10,
                'margin_bottom' => 10,
            ]);

            $mpdf->WriteHTML($html);
            $mpdf->Output($pdfPath, Destination::FILE);
            $mpdf = null;

            unset($faqs, $html);
            gc_collect_cycles();
        });

        $files = glob("$tmpDir/part-*.pdf");
        sort($files, SORT_NATURAL | SORT_FLAG_CASE);
        $merger = new Merger(new TcpdiDriver()); // new Merger()
        foreach ($files as $file) {
            $merger->addFile($file);
        }
        $finalBinary = $merger->merge();

        $finalPath = $tmpDir . '/final.pdf';
        file_put_contents($finalPath, $finalBinary);

        if ($export) {
            $export->addMedia($finalPath)
                ->usingFileName('faqs-' . now()->format('Ymd-His') . '.pdf')
                ->toMediaCollection('faq_exports');
            $export->update(['status' => 'done']);
        }

        foreach (glob("$tmpDir/*.pdf") as $f) @unlink($f);
        @rmdir($tmpDir);
    }
}
