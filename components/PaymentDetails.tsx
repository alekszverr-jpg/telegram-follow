import Image from "next/image";
import { paymentMode } from "@/lib/payment-config";
import { validatePayAnyWayForm, type PayAnyWayForm } from "@/lib/payanyway-form";

export type SavedOrder = { requestId: string; amount: number; plan: string; provider?: "bank" | "prodamus" | "payanyway" | "yookassa"; providerLocked?: boolean; paymentUrl?: string; paymentForm?: PayAnyWayForm; paymentStatus?: string };

export function PaymentDetails({ order }: { order: SavedOrder }) {
  const mode = order.provider && (order.providerLocked || order.provider === "yookassa") ? order.provider : paymentMode;
  const paid = order.paymentStatus === "Оплачено";
  const testPaid = order.paymentStatus === "Тестовая оплата";
  const canceled = order.paymentStatus === "Отменена";
  const heading = paid ? "Заказ оплачен" : testPaid ? "Тестовый платёж прошёл" : canceled ? "Платёж отменён" : "Заявка сохранена — можно оплатить";
  const paymentForm = validatePayAnyWayForm(order.paymentForm, order.requestId, order.amount);
  return (
    <section className="order-payment" aria-label="Оплата заявки" data-clarity-mask="true">
      <h3>{heading}</h3>
      <dl className="order-summary">
        <div><dt>Номер заявки</dt><dd>{order.requestId}</dd></div>
        <div><dt>Пакет</dt><dd>{order.plan}</dd></div>
        <div><dt>К оплате</dt><dd className="order-amount">{order.amount.toLocaleString("ru-RU")} ₽</dd></div>
      </dl>
      {paid ? <p>Оплата получена.</p> : testPaid ? <p>Тестовый заказ сохранён.</p> : mode === "yookassa" ? (
        !canceled && order.provider === "yookassa" && order.paymentUrl ? <>
          <p>Сумма заказа уже указана на странице оплаты.</p>
          <a className="payment-prodamus-button" href={order.paymentUrl} rel="noreferrer">Оплатить через ЮKassa</a>
        </> : <p>Ссылка на оплату недоступна. Напишите на <a href="mailto:realbuzzmanager@yandex.ru">realbuzzmanager@yandex.ru</a> и укажите номер заявки.</p>
      ) : mode === "payanyway" ? (
        order.provider === "payanyway" && paymentForm ? <>
          <p>Оплатите выбранный пакет. Сумма уже указана на странице оплаты.</p>
          <form action={paymentForm.action} method="post">
            {Object.entries(paymentForm.fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
            <button className="payment-prodamus-button" type="submit">Оплатить</button>
          </form>
        </> : <p>Оплата временно недоступна. Напишите на realbuzzmanager@yandex.ru.</p>
      ) : mode === "prodamus" ? (
        order.provider === "prodamus" && order.paymentUrl ? <>
          <p>Оплатите выбранный пакет. Сумма уже указана на странице оплаты.</p>
          <a className="payment-prodamus-button" href={order.paymentUrl}>Оплатить</a>
        </> : <p>Оплата временно недоступна. Попробуйте чуть позже или напишите на realbuzzmanager@yandex.ru.</p>
      ) : <>
      <p><span className="payment-instruction--desktop">Выберите банк, отсканируйте QR-код и введите сумму.</span><span className="payment-instruction--mobile">Выберите банк и введите сумму.</span></p>
      <div className="payment-banks">
        <article className="payment-bank">
          <h4>Сбер и Т-Банк</h4>
          <Image src="/payments/sber.png" width={600} height={600} alt="QR-код оплаты через Сбер" />
          <a href="https://www.sberbank.ru/ru/choise_bank?requisiteNumber=79174812644&bankCode=100000000111" target="_blank" rel="noopener noreferrer">Оплатить</a>
          <small className="payment-help">Не открывается? Попробуйте Яндекс Браузер.</small>
          <small className="payment-help payment-help--desktop">QR-код можно сканировать в приложении банка.</small>
        </article>
        <article className="payment-bank">
          <h4>Альфа, Газпромбанк, ВТБ, МТС Банк, Совкомбанк</h4>
          <Image src="/payments/alfa.png" width={600} height={600} alt="QR-код оплаты через Альфа-Банк" />
          <a href="https://c2c.cbrpay.ru/BS1I000S80DJB659986O6F6FV53371EP" target="_blank" rel="noopener noreferrer">Оплатить</a>
        </article>
      </div>
      </>}
      {paid && <p className="payment-support">Есть вопросы по заказу? <a href="https://t.me/Savkin_1337" target="_blank" rel="noopener noreferrer">Напишите нам в Telegram</a>.</p>}
    </section>
  );
}
