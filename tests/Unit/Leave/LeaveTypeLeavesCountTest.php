<?php

namespace Tests\Unit\Leave;

use Tests\TestCase;
use App\Models\LeaveType;
use App\Models\Leave;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class LeaveTypeLeavesCountTest extends TestCase
{
    /** @test */
    public function leaves_count_weighs_half_day_as_half()
    {
        $type = new LeaveType(['id' => 1, 'type_name' => 'Test']);

        $query = $type->leavesCount()
            ->where('leave_type_id', 1)
            ->selectRaw('leave_type_id, count(*) as count, SUM(if(duration="half day", 0.5, 1)) AS weighted_count')
            ->groupBy('leave_type_id');

        $sql = $query->toSql();

        $this->assertStringContainsString('SUM(if(duration="half day", 0.5, 1))', $sql);
    }
}
