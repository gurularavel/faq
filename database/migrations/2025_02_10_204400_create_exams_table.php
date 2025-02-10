<?php

use App\Models\QuestionGroup;
use App\Models\User;
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
        Schema::create('exams', static function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(QuestionGroup::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->string('is_started', 30)->default('false');
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->timestamps();
            $table->nullableMorphs('creatable');
            $table->nullableMorphs('updatable');
            $table->nullableMorphs('deletable');
            $table->string('is_deleted', 30)->default('false');
            $table->softDeletes();

            $table->unique(['question_group_id', 'user_id', 'is_started', 'is_deleted'], 'question_group_user_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
