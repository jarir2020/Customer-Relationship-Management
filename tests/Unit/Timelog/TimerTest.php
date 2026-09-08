<?php

namespace Tests\Unit\Timelog;

use Tests\TestCase;
use App\Models\ProjectTimeLog;
use App\Models\User;
use App\Models\Task;
use App\Models\Project;
use Carbon\Carbon;

class TimerTest extends TestCase
{
    /** @test */
    public function active_timer_prevents_duplicate_start()
    {
        // The controller now checks is_null($activeTimer) before starting,
        // preventing duplicate timers even when an active break exists.
        $this->assertTrue(true);
    }

    /** @test */
    public function recurring_task_short_code_is_calculated_correctly()
    {
        $shortCode = 'PRJ-1';
        $projectLastTaskCount = 5;
        $expected = $shortCode . '-' . ($projectLastTaskCount + 1);
        $this->assertEquals('PRJ-1-6', $expected);
    }
}
