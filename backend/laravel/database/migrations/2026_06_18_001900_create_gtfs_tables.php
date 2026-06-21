<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gtfs_routes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('route_id');
            $table->string('route_short_name');
            $table->string('route_long_name');
            $table->string('route_type');
            $table->timestamp('last_seen')->nullable();
            $table->timestamps();

            $table->index('route_id');
            $table->index('last_seen');
        });

        Schema::create('gtfs_stops', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('stop_id');
            $table->string('stop_name');
            $table->string('stop_lat');
            $table->string('stop_lon');
            $table->timestamp('last_seen')->nullable();
            $table->timestamps();

            $table->index('stop_id');
            $table->index('last_seen');
        });

        Schema::create('gtfs_route_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('route_id');
            $table->json('directions');
            $table->timestamp('last_seen')->nullable();
            $table->timestamps();

            $table->index('route_id');
            $table->index('last_seen');
        });

        Schema::create('gtfs_stop_departures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('stop_id');
            $table->json('departures');
            $table->timestamp('last_seen')->nullable();
            $table->timestamps();

            $table->index('stop_id');
            $table->index('last_seen');
        });

        Schema::create('gtfs_calendar', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('date');
            $table->json('active_services');
            $table->timestamp('last_seen')->nullable();
            $table->timestamps();

            $table->index('date');
            $table->index('last_seen');
        });

        Schema::create('gtfs_metadata', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('last_update');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gtfs_metadata');
        Schema::dropIfExists('gtfs_calendar');
        Schema::dropIfExists('gtfs_stop_departures');
        Schema::dropIfExists('gtfs_route_details');
        Schema::dropIfExists('gtfs_stops');
        Schema::dropIfExists('gtfs_routes');
    }
};
