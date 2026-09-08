<?php

namespace App\Models;

use App\Traits\HasCompany;

/**
 * App\Models\InvoiceReminderSetting
 *
 * @property int $id
 * @property int $company_id
 * @property int $days_before_due
 * @property int $days_after_due
 * @property int|null $repeat_every_days
 * @property int|null $max_reminders
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company|null $company
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting query()
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting whereDaysBeforeDue($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting whereDaysAfterDue($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting whereRepeatEveryDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting whereMaxReminders($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|InvoiceReminderSetting whereUpdatedAt($value)
 */
class InvoiceReminderSetting extends BaseModel
{
    use HasCompany;

    protected $guarded = ['id'];
}
