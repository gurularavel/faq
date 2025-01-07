<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $role = Role::query()->firstOrCreate(["name" => "Admin", "guard_name" => "admin"]);

        $admin = Admin::query()->firstOrCreate(
            [
                'username' => 'admin',
            ],
            [
                'email' => 'sahib@fermanli.net',
                'name' => 'Sahib',
                'surname' => 'Fermanli',
                'password' => '12345678',
            ]
        );

        $admin->assignRole($role);
    }
}
