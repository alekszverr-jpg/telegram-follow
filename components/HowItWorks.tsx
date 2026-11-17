const steps = [
  {
    title: "Вы оставляете заявку",
    text: "Указываете ваши контакты и ссылку на Telegram-канал. Больше ничего заполнять не нужно."
  },
  {
    title: "Мы смотрим канал",
    text: "Проверяем тематику, оформление, описание и последние посты, чтобы понять, насколько канал готов к запуску."
  },
  {
    title: "Размещаем задание на подписку",
    text: "Пользователи получают вознаграждение за подписку на ваш канал."
  },
  {
    title: "Люди подписываются сами",
    text: "Пользователь самостоятельно подписывается в рамках задания. Мы не добавляем людей в канал автоматически."
  },
  {
    title: "Вы получаете результат",
    text: "Выполняем объём выбранного пакета в указанный срок после запуска заказа."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-pad">
      <div className="container-shell">
        <div className="max-w-2xl">
          <p className="section-kicker">Процесс</p>
          <h2 className="section-title">Как это работает</h2>
        </div>

        <ol className="steps-list">
          {steps.map((step, index) => (
            <li key={step.title} className="step-item">
              <span className="step-number" aria-hidden="true">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

