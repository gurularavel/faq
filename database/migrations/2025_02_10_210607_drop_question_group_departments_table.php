<?php

use App\Models\Department;
use App\Models\QuestionGroup;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('question_group_departments');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('question_group_departments', static function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(QuestionGroup::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Department::class)->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->nullableMorphs('creatable');
            $table->nullableMorphs('updatable');
            $table->nullableMorphs('deletable');
            $table->string('is_deleted', 30)->default('false');
            $table->softDeletes();

            $table->unique(['question_group_id', 'department_id', 'is_deleted'], 'question_group_department_unique');
        });
    }
};
