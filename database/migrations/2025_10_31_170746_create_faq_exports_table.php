<?php

use App\Enum\FaqExportStatusEnum;
use App\Models\Language;
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
        Schema::create('faq_exports', static function (Blueprint $table) {
            $table->id();
            $table->uuid();
            $table->foreignIdFor(Language::class)->constrained()->cascadeOnDelete();
            $table->string('status', 15)->default(FaqExportStatusEnum::QUEUED->value)->comment('FaqExportStatusEnum');
            $table->dateTime('last_status_at')->nullable();
            $table->json('messages')->nullable();
            $table->dateTime('downloaded_at')->nullable();
            $table->timestamps();
            $table->nullableMorphs('creatable');
            $table->nullableMorphs('updatable');
            $table->nullableMorphs('deletable');
            $table->string('is_deleted', 30)->default('false');
            $table->softDeletes();

            $table->unique(['uuid', 'is_deleted']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faq_exports');
    }
};
