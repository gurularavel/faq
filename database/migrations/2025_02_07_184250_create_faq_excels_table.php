<?php

use App\Enum\FaqExcelStatusEnum;
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
        Schema::create('faq_excels', static function (Blueprint $table) {
            $table->id();
            $table->enum('status', array_column(FaqExcelStatusEnum::cases(), 'value'))->default(FaqExcelStatusEnum::PENDING->value);
            $table->json('messages')->nullable();
            $table->timestamps();
            $table->nullableMorphs('creatable');
            $table->nullableMorphs('updatable');
            $table->nullableMorphs('deletable');
            $table->string('is_deleted', 30)->default('false');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faq_excels');
    }
};
