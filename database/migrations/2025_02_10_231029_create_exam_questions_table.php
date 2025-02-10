<?php

use App\Models\Answer;
use App\Models\Exam;
use App\Models\Question;
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
        Schema::create('exam_questions', static function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Exam::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Question::class)->constrained()->cascadeOnDelete();
            $table->dateTime('sent_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->foreignIdFor(Answer::class)->nullable()->constrained()->nullOnDelete();
            $table->dateTime('answered_at')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('point')->default(0);
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
        Schema::dropIfExists('exam_questions');
    }
};
