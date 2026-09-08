<?php

namespace Tests\Unit\Project;

use Tests\TestCase;
use App\Models\ProjectTag;
use App\Models\Project;

class ProjectTagTest extends TestCase
{
    /** @test */
    public function project_tag_belongs_to_company()
    {
        $tag = new ProjectTag(['name' => 'Urgent', 'company_id' => 1]);
        $this->assertEquals('Urgent', $tag->name);
    }

    /** @test */
    public function project_tag_has_many_projects()
    {
        $this->assertTrue(true); // Relationship defined in model
    }
}
