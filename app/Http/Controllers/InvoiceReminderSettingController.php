<?php

namespace App\Http\Controllers;

use App\Helper\Reply;
use App\Models\InvoiceReminderSetting;
use Illuminate\Http\Request;

class InvoiceReminderSettingController extends AccountBaseController
{
    public function __construct()
    {
        parent::__construct();
        $this->pageTitle = 'app.menu.invoiceReminderSettings';
        $this->activeSettingMenu = 'invoice_settings';
    }

    public function index()
    {
        $this->settings = InvoiceReminderSetting::where('company_id', company()->id)->firstOrCreate([
            'company_id' => company()->id,
        ]);
        return view('invoice-reminder-settings.index', $this->data);
    }

    public function update(Request $request)
    {
        $request->validate([
            'days_before_due' => 'required|integer|min:0',
            'days_after_due' => 'required|integer|min:0',
            'repeat_every_days' => 'nullable|integer|min:1',
            'max_reminders' => 'nullable|integer|min:1',
        ]);

        $settings = InvoiceReminderSetting::where('company_id', company()->id)->firstOrFail();
        $settings->update($request->only([
            'days_before_due', 'days_after_due', 'repeat_every_days', 'max_reminders'
        ]));

        return Reply::success(__('messages.updatedSuccessfully'));
    }
}
