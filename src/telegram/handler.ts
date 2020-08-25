import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import ModelFactoryInterface from "../models/typings/ModelFactoryInterface";

dotenv.config();

const token = process.env.TELEGRAM_TOKEN!;
const bot = new TelegramBot(token, { polling: true });

function teleHandler(models: ModelFactoryInterface) {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        if (msg.text === '/start') return bot.sendMessage(chatId, 'Selamat datang. Klik tombol `Aktifkan Notifikasi` pada web UPTMR dan kirimkan kode yang muncul untuk memulai');
        const telegram_code = parseInt(msg.text!);
        if (!isNaN(telegram_code)) {
            const user = await models.User.findOne({ where: { telegram_code } });
            if (!user) return bot.sendMessage(chatId, 'Kode akun tidak ditemukan');
            if (user?.telegram_chat_id) return bot.sendMessage(chatId, `Halo ${user.name}. Akun anda sudah terdaftar, tidak perlu mengirim kode verifikasi lagi`);
            await user.update({ telegram_chat_id: chatId });
            bot.sendMessage(chatId, `Salam kenal ${user.name}! Fitur notifikasi sukses diaktifkan. Kedepan, saya akan mengirimkan pemberitahuan terkait akun anda lewat chat ini :)`);
        } else {
            bot.sendMessage(chatId, 'Kode akun tidak valid')
        }
    });
}

export { bot };

export default teleHandler;