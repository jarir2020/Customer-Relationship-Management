<?php

namespace App\Models;

use App\Traits\HasCompany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * App\Models\LeadEmail
 *
 * @property int $id
 * @property int $company_id
 * @property int $lead_id
 * @property int $sent_by
 * @property string $subject
 * @property text $body
 * @property string $recipient_email
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company|null $company
 * @property-read \App\Models\Lead|null $lead
 * @property-read \App\Models\User|null $sender
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail query()
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail whereSentBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail whereSubject($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail whereRecipientEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|LeadEmail whereUpdatedAt($value)
 */
class LeadEmail extends BaseModel
{
    use HasCompany;

    protected $guarded = ['id'];

    protected $casts = [
        'body' => 'array',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
