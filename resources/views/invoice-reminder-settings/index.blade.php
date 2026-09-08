@extends('layouts.app')

@section('content')
<x-setting-card>
    <x-slot name="header">
        <div class="s-b-n-header">
            <h3 class="heading-h3 mb-0">@lang('app.invoiceReminderSettings')</h3>
        </div>
    </x-slot>

    <x-slot name="body">
        <x-form id="reminderSettingsForm" method="POST" class="ajax-form" action="{{ route('invoice-reminder-settings.update', $settings->id) }}">
            @method('PUT')

            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label class="f-14 text-dark-grey mb-12">@lang('app.daysBeforeDue')</label>
                        <input type="number" name="days_before_due" class="form-control height-35 f-14"
                               value="{{ $settings->days_before_due }}" min="0">
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="form-group">
                        <label class="f-14 text-dark-grey mb-12">@lang('app.daysAfterDue')</label>
                        <input type="number" name="days_after_due" class="form-control height-35 f-14"
                               value="{{ $settings->days_after_due }}" min="0">
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="form-group">
                        <label class="f-14 text-dark-grey mb-12">@lang('app.repeatEveryDays')</label>
                        <input type="number" name="repeat_every_days" class="form-control height-35 f-14"
                               value="{{ $settings->repeat_every_days }}" min="1" placeholder="@lang('app.optional')">
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="form-group">
                        <label class="f-14 text-dark-grey mb-12">@lang('app.maxReminders')</label>
                        <input type="number" name="max_reminders" class="form-control height-35 f-14"
                               value="{{ $settings->max_reminders }}" min="1" placeholder="@lang('app.optional')">
                    </div>
                </div>
            </div>

            <x-buttons.primary>
                <i class="fa fa-check mr-2"></i> @lang('app.save')
            </x-buttons.primary>
        </x-form>
    </x-slot>
</x-setting-card>
@endsection
