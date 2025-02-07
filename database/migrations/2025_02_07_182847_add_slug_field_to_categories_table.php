<?php

use App\Models\Category;
use App\Services\LangService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', static function (Blueprint $table) {
            $table->string('slug', 350)->nullable()->after('id');
        });

        $defaultLanguageId = LangService::instance()->getDefaultLangId();

        $categories = Category::withTrashed()
            ->with([
                'translatable' => static function ($query) use($defaultLanguageId) {
                    $query->withTrashed()
                        ->where('language_id', $defaultLanguageId)
                        ->where('column', 'title')
                        ->orderByDesc('id')
                        ->limit(1);
                },
            ])
            ->get();

        foreach ($categories as $category) {
            $category->slug = Str::slug($category->translatable->first()->text . '-' . $category->id);
            $category->save();
        }

        Schema::table('categories', static function (Blueprint $table) {
            $table->string('slug', 350)->nullable(false)->change();

            $table->unique(['slug', 'is_deleted']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', static function (Blueprint $table) {
            $table->dropUnique(['slug', 'is_deleted']);

            $table->dropColumn('slug');
        });
    }
};
