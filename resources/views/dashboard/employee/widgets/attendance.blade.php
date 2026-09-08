@if (in_array('attendance', $activeWidgets) && in_array('attendance', user_modules()))
    @php
        $attendances = \App\Models\Attendance::where('user_id', user()->id)
            ->orderBy('clock_in_time', 'desc')
            ->limit(7)
            ->get();
    @endphp

    <div class="col-md-12">
        <div class="card border-0 b-shadow-4 mb-3">
            <div class="card-header border-0 bg-white">
                <div class="card-title">
                    <h5 class="mb-0">@lang('app.menu.attendance')</h5>
                </div>
            </div>
            <div class="card-body">
                @if ($attendances->count() > 0)
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>@lang('app.date')</th>
                                    <th>@lang('app.clockIn')</th>
                                    <th>@lang('app.clockOut')</th>
                                    <th>@lang('app.status')</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($attendances as $attendance)
                                    <tr>
                                        <td>{{ $attendance->clock_in_time?->format(company()->date_format) }}</td>
                                        <td>{{ $attendance->clock_in_time?->format('H:i') }}</td>
                                        <td>{{ $attendance->clock_out_time?->format('H:i') ?? '--' }}</td>
                                        <td>
                                            @if ($attendance->late_mark)
                                                <span class="badge badge-warning">@lang('app.late')</span>
                                            @else
                                                <span class="badge badge-success">@lang('app.onTime')</span>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <p class="mb-0 text-muted">@lang('messages.noRecord')</p>
                @endif
            </div>
        </div>
    </div>
@endif
