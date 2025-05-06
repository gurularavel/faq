<?php

namespace App\Console\Commands;

use App\Repositories\FaqRepository;
use Illuminate\Console\Command;

class IndexFaqsCommand extends Command
{
    protected $signature = 'faq:index';
    protected $description = 'Index all active FAQs into Elasticsearch using bulk indexing';

    public function handle(): void
    {
        $faqRepo = new FaqRepository();

        $faqRepo->deleteIndex();
        $this->info('Old index deleted.');

        $faqRepo->createIndex();
        $this->info('New index created.');

        $faqRepo->generateIndex();
        $this->info('FAQs indexed successfully!');
    }
}
