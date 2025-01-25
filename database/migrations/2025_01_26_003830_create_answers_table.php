<?php

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
        Schema::create('answers', static function (Blueprint $table) {
            $table->id();
            $table->uuid();
            $table->foreignIdFor(Question::class)->constrained()->cascadeOnDelete();
            $table->boolean('is_correct')->default(false);
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
        Schema::dropIfExists('answers');
    }
};
