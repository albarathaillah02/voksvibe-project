<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendOtpNotification extends Notification
{
    use Queueable;

    protected $otp;

    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Kode OTP Pemulihan Akun VOKSVIBE')
                    ->greeting('Halo!')
                    ->line('Kami menerima permintaan pemulihan kata sandi untuk akun Anda.')
                    ->line('Jangan bagikan kode ini kepada siapa pun. Berikut adalah kode OTP Anda:')
                    ->line('**' . $this->otp . '**')
                    ->line('Kode ini hanya berlaku selama 5 menit.')
                    ->line('Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini.');
    }
}