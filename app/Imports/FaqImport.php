<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\Faq;
use App\Models\FaqExcel;
use App\Services\LangService;
use App\Services\LoggerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class FaqImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    private FaqExcel $faqExcel;
    protected array $messages;

    public function __construct(FaqExcel $faqExcel)
    {
        $this->faqExcel = $faqExcel;
    }

    public function collection(Collection $collection): void
    {
        DB::transaction(function () use ($collection, &$messages) {
            foreach ($collection as $row) {
                $categoryTitle = $row['kateqoriya'] ?? null;
                $subCategoryTitle = $row['alt_kateqoriya'] ?? null;
                $questionTitle = $row['sual'] ?? null;
                $answerTitle = $row['cavab'] ?? null;

                if (!$categoryTitle || !$subCategoryTitle || !$questionTitle || !$answerTitle) {
                    $messages = $this->faqExcel->messages;
                    $messages[] = 'Invalid excel data.';
                    $this->faqExcel->messages = $messages;
                    LoggerService::instance()->log('Invalid excel data.' . json_encode($row), [], true, 'error');
                    DB::rollBack();
                    break;
                }

                $languages = LangService::instance()->getLanguages();

                // save parent category
                $categorySlug = Str::slug($categoryTitle);

                $category = Category::query()
                    ->where('slug', $categorySlug)
                    ->orderByDesc('id')
                    ->first();

                if (!$category) {
                    /** @var Category $category */
                    $category = $this->faqExcel->categories()->create([
                        'slug' => $categorySlug,
                    ]);

                    foreach ($languages as $language) {
                        $category->setLang('title', $categoryTitle, $language['id']);
                    }

                    $category->saveLang();
                }

                if ($category->category_id) {
                    $messages = $this->faqExcel->messages;
                    $messages[] = 'Invalid category. Slug: ' . $categorySlug;
                    $this->faqExcel->messages = $messages;
                    LoggerService::instance()->log('Invalid category. Slug: ' . $categorySlug, [], true, 'error');
                    DB::rollBack();
                    break;
                }

                // save sub category
                $subCategorySlug = Str::slug($subCategoryTitle);

                $subCategory = Category::query()
                    ->where('slug', $subCategorySlug)
                    ->orderByDesc('id')
                    ->first();

                if (!$subCategory) {
                    /** @var Category $subCategory */
                    $subCategory = $this->faqExcel->categories()->create([
                        'category_id' => $category->id,
                        'slug' => $subCategorySlug,
                    ]);

                    foreach ($languages as $language) {
                        $subCategory->setLang('title', $subCategoryTitle, $language['id']);
                    }

                    $subCategory->saveLang();
                }

                if ($subCategory->category_id !== $category->id) {
                    $messages = $this->faqExcel->messages;
                    $messages[] = 'Invalid sub category. Slug: ' . $subCategorySlug;
                    $this->faqExcel->messages = $messages;
                    LoggerService::instance()->log('Invalid sub category. Slug: ' . $subCategorySlug, [], true, 'error');
                    DB::rollBack();
                    break;
                }

                // save faq
                /** @var Faq $faq */
                $faq = $this->faqExcel->faqs()
                    ->create([
                        'category_id' => $subCategory->id,
                    ]);

                foreach ($languages as $language) {
                    $faq->setLang('question', $questionTitle, $language['id']);
                    $faq->setLang('answer', $answerTitle, $language['id']);
                }

                $faq->saveLang();
            }
        });
    }

    /**
     * Define the chunk size.
     */
    public function chunkSize(): int
    {
        return 100;
    }
}
