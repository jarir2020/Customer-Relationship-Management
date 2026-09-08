@if($invoice->invoicePaymentDetail)
    <table class="table table-bordered mt-4" style="width:50%">
        <thead class="thead-light">
        <tr style="border-bottom: 1px solid #e7e9eb; color:#555555; background-color:#e7e9eb; font-size: 14px;">
            <th class="description" style="text-align: left; padding: 10px; border: 1px solid #e7e9eb;">@lang('modules.invoices.paymentDetails')</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td class="description f-14 text-dark" style="padding: 10px;">
                <p><span  class="float-left"> <strong>{{ $invoice->invoicePaymentDetail->title }}</strong><br>
                                                    {!! !empty($invoice->invoicePaymentDetail->payment_details)
                                                    ? nl2br(e($invoice->invoicePaymentDetail->payment_details)) : '--' !!}</span>


                </p>
            </td>
            <td>@if($invoice->invoicePaymentDetail->image)<span class="float-right"> <img src="{{$invoice->invoicePaymentDetail->image_url}}" height="150px" width="150px"/></span>@endif</td>
        </tr>
        </tbody>
    </table>
@endif
