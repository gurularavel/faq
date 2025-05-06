<?php

namespace App\Repositories;

use App\Enum\FaqExcelStatusEnum;
use App\Http\Requests\Admin\Faqs\FaqImportRequest;
use App\Jobs\FaqImportJob;
use App\Models\Admin;
use App\Models\Category;
use App\Models\Faq;
use App\Models\FaqExcel;
use App\Models\ModelTranslation;
use App\Services\FileUpload;
use App\Services\LangService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class FaqExcelRepository
{
    public function store(FaqImportRequest $request): FaqExcel
    {
        return DB::transaction(function () use ($request) {
            $faqExcel = FaqExcel::query()->create($request->validated());

            FileUpload::upload($request, 'file', 'faq_excels', $faqExcel);

            return $faqExcel;
        });
    }

    public function changeStatus(FaqExcel $faqExcel, FaqExcelStatusEnum $faqExcelStatusEnum): void
    {
        $faqExcel->status = $faqExcelStatusEnum->value;
        $faqExcel->save();
    }

    public function rollbackData(FaqExcel $faqExcel, Admin $user): void
    {
        $now = Carbon::now();

        $faqExcel->load([
            'faqs',
            'categories',
        ]);

        $faqsIds = $faqExcel->faqs->pluck('id')->toArray();
        $faqExcel->faqs()
            ->update([
                'deletable_id' => $user->id,
                'deletable_type' => $user->getMorphClass(),
                'is_deleted' => DB::raw("CONCAT('deleted_', id)"),
                'deleted_at' => $now,
            ]);

        ModelTranslation::query()
            ->whereIn('translatable_id', $faqsIds)
            ->where('translatable_type', Faq::class)
            ->update([
                'deletable_id' => $user->id,
                'deletable_type' => $user->getMorphClass(),
                'is_deleted' => DB::raw("CONCAT('deleted_', id)"),
                'deleted_at' => $now,
            ]);

        $categoriesIds = $faqExcel->categories->pluck('id')->toArray();
        $faqExcel->categories()
            ->update([
                'deletable_id' => $user->id,
                'deletable_type' => $user->getMorphClass(),
                'is_deleted' => DB::raw("CONCAT('deleted_', id)"),
                'deleted_at' => $now,
            ]);

        ModelTranslation::query()
            ->whereIn('translatable_id', $categoriesIds)
            ->where('translatable_type', Category::class)
            ->update([
                'deletable_id' => $user->id,
                'deletable_type' => $user->getMorphClass(),
                'is_deleted' => DB::raw("CONCAT('deleted_', id)"),
                'deleted_at' => $now,
            ]);
    }

    public function import(FaqImportRequest $request): void
    {
        $faqExcel = $this->store($request);

        FaqImportJob::dispatch($faqExcel, auth('admin')->user());
    }

    public function load(): Collection
    {
        return FaqExcel::query()
            ->with([
                'creatable',
            ])
            ->withCount([
                'categories',
                'faqs',
            ])
            ->orderByDesc('id')
            ->limit(10)
            ->get();
    }

    public function rollback(FaqExcel $faqExcel): void
    {
        if ($faqExcel->status !== FaqExcelStatusEnum::IMPORTED->value) {
            throw new BadRequestHttpException(
                LangService::instance()
                    ->setDefault('Faq excel not imported!')
                    ->getLang('faq_excel_not_imported')
            );
        }

        DB::transaction(function () use ($faqExcel) {
            /** @var Admin $user */
            $user = auth('admin')->user();

            $this->rollbackData($faqExcel, $user);

            (new FaqRepository())->reGenerateIndex();

            $this->changeStatus($faqExcel, FaqExcelStatusEnum::ROLLBACK);
        });
    }
}
