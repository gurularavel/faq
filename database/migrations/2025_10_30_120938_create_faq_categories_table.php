<?php

use App\Models\Category;
use App\Models\Faq;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faq_categories', static function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Faq::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Category::class)->comment('sub category id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->nullableMorphs('creatable');
            $table->nullableMorphs('updatable');
            $table->nullableMorphs('deletable');
            $table->string('is_deleted', 30)->default('false');
            $table->softDeletes();

            $table->unique(['faq_id', 'category_id', 'is_deleted']);
        });

        $faqs = Faq::query()->get();

        foreach ($faqs as $faq) {
            /* @var Faq $faq */
            $faq->categories()->attach($faq->category_id);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faq_categories');
    }
};
