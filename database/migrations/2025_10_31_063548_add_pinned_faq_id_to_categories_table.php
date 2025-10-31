<?php

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
        Schema::table('categories', static function (Blueprint $table) {
            $table->foreignIdFor(Faq::class, 'pinned_faq_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', static function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Faq::class, 'pinned_faq_id');
        });
    }
};
