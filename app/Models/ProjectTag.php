<?php

namespace App\Models;

use App\Traits\HasCompany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * App\Models\ProjectTag
 *
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string|null $color
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company|null $company
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Project[] $projects
 * @method static \Illuminate\Database\Eloquent\Builder|ProjectTag newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProjectTag newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProjectTag query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProjectTag whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProjectTag whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProjectTag whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProjectTag whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProjectTag whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProjectTag whereUpdatedAt($value)
 */
class ProjectTag extends BaseModel
{
    use HasCompany;

    protected $guarded = ['id'];

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_project_tag');
    }
}
