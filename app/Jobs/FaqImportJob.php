<?php

namespace App\Jobs;

use App\Enum\FaqExcelStatusEnum;
use App\Imports\FaqImport;
use App\Models\Admin;
use App\Models\FaqExcel;
use App\Repositories\FaqExcelRepository;
use App\Repositories\FaqRepository;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class FaqImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private FaqExcel $faqExcel;
    private FaqExcelRepository $faqExcelRepo;
    private Admin $user;

    public function __construct(FaqExcel $faqExcel, Admin $user)
    {
        $this->faqExcel = $faqExcel;
        $this->user = $user;
        $this->faqExcelRepo = new FaqExcelRepository();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->faqExcelRepo->changeStatus($this->faqExcel, FaqExcelStatusEnum::PROCESSING);

        $this->faqExcel->load([
            'media',
        ]);

        Excel::import(new FaqImport($this->faqExcel), $this->faqExcel->file_path);

        $this->faqExcel->status = count($this->faqExcel->messages ?? []) ? FaqExcelStatusEnum::FAILED->value : FaqExcelStatusEnum::IMPORTED->value;
        $this->faqExcel->save();

        if ($this->faqExcel->status === FaqExcelStatusEnum::FAILED->value) {
            DB::transaction(function () {
                $this->faqExcelRepo->rollbackData($this->faqExcel, $this->user);
            });
        }

        (new FaqRepository())->reGenerateIndex();
    }
}
