<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddLdapColumnsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('samaccountname')->nullable()->comment('username, unique');
            $table->string('objectguid')->nullable()->comment('guid, unique');
            $table->string('displayname')->nullable();
            $table->string('distinguishedname')->nullable();
            $table->dateTime('lastlogon')->nullable();
            $table->string('accountexpires')->nullable();

            $table->unique(['samaccountname', 'is_deleted']);
            $table->unique(['objectguid', 'is_deleted']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['samaccountname', 'is_deleted']);
            $table->dropUnique(['objectguid', 'is_deleted']);

            $table->dropColumn('samaccountname');
            $table->dropColumn('objectguid');
            $table->dropColumn('displayname');
            $table->dropColumn('distinguishedname');
            $table->dropColumn('lastlogon');
            $table->dropColumn('accountexpires');
        });
    }
}
