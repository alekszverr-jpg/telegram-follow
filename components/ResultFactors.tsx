import { CheckIcon } from "./Icons";

const factors = [
  "доступен ли канал по указанной ссылке",
  "понятно ли оформлено описание канала",
  "есть ли в канале свежие посты",
  "можно ли свободно подписаться на канал",
  "соответствует ли ссылка заказанной площадке"
];

export function ResultFactors() {
  return (
    <>
      <section className="section-pad">
        <div className="container-shell grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-8">
          <div>
            <p className="section-kicker">Результат</p>
            <h2 className="section-title">Что нужно для выполнения заказа</h2>
            <p className="section-copy">
              Пользователи подписываются в рамках оплачиваемых заданий. Перед запуском проверяем ссылку и возможность подписки.
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Количество подписчиков само по себе не гарантирует интерес к контенту, просмотры, сообщения или покупки. Пользователи могут отписаться после выполнения задания.
            </p>
          </div>

          <div className="result-checklist">
            <p className="text-base font-semibold text-ink">Перед запуском проверяем</p>
            <ul>
              {factors.map((factor) => (
                <li key={factor}>
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-telegram-50 text-telegram-700">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-shell">
          <article className="editorial-content">
            <h2 className="section-title">Живые подписчики в Телеграм без ботов</h2>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">
              <p>
                Услуга увеличивает число подписчиков за счёт реальных пользователей, выполняющих оплачиваемые задания. В пакет входит указанное количество подписок. Просмотры публикаций, реакции, обращения и продажи в стоимость пакета не входят.
              </p>
              <p>
                После оплаты и проверки заявки размещаем задание на подписку. Пользователи самостоятельно переходят по ссылке и подписываются за вознаграждение. Срок выполнения указан в выбранном пакете; о результате сообщаем по вашему контакту.
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

