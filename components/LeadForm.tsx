import { FormEvent, useEffect, useRef, useState } from "react";
import type { PricingPlan } from "@/data/content";
import { CheckIcon } from "./Icons";
import { normalizeChannelLink } from "@/lib/channel-link";
import { PaymentDetails, type SavedOrder } from "./PaymentDetails";
import { validatePayAnyWayForm } from "@/lib/payanyway-form";

type LeadFormProps = {
  plans: PricingPlan[];
  selectedPlan: PricingPlan | null;
  onSelectPlan: (plan: PricingPlan) => void;
};

const leadEndpoint =
  "https://script.google.com/macros/s/AKfycby2bRUuVzYXiMHYHQPX20AZ6v0iKcQHUeRY4ejFoo-LzDhIGlk34IUS9SBRBnPNbH_k/exec";

type LeadGoal = "tg_form_start" | "tg_lead_success";

function trackLeadGoal(goal: LeadGoal) {
  // The consent script defines ym only after the visitor enables analytics.
  const { ym } = window as Window & { ym?: (counter: number, method: "reachGoal", target: LeadGoal) => void };
  if (typeof ym !== "function") return false;

  try {
    ym(109558727, "reachGoal", goal);
    return true;
  } catch {
    return false;
  }
}

export function LeadForm({ plans, selectedPlan, onSelectPlan }: LeadFormProps) {
  const [contact, setContact] = useState("");
  const [channel, setChannel] = useState("");
  const [errors, setErrors] = useState<{ contact?: string; channel?: string }>({});
  const [isSent, setIsSent] = useState(false);
  const [savedOrder, setSavedOrder] = useState<SavedOrder | null>(null);
  const submission = useRef<{ payload: string; token: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const planPicker = useRef<HTMLDetailsElement>(null);
  const planSummary = useRef<HTMLElement>(null);
  const contactInput = useRef<HTMLInputElement>(null);
  const channelInput = useRef<HTMLInputElement>(null);
  const successPanel = useRef<HTMLDivElement>(null);
  const formStartTracked = useRef(false);
  const leadSuccessTracked = useRef(false);

  useEffect(() => {
    if (isSent) {
      successPanel.current?.focus({ preventScroll: true });
      successPanel.current?.scrollIntoView({ block: "start" });
    }
  }, [isSent]);

  const selectedPlanLabel = selectedPlan
    ? `${selectedPlan.name} — ${selectedPlan.subscribers} за ${selectedPlan.price}`
    : "";

  const trackFormStart = () => {
    if (!formStartTracked.current) formStartTracked.current = trackLeadGoal("tg_form_start");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSent || isSubmitting) return;
    trackFormStart();
    setSubmitError("");

    const nextErrors: { contact?: string; channel?: string } = {};
    if (!contact.trim()) {
      nextErrors.contact = "Укажите ваши контакты.";
    }
    const normalizedLink = normalizeChannelLink("Telegram", channel);
    if (!normalizedLink) {
      nextErrors.channel = "Укажите ссылку вида https://t.me/channel, t.me/channel или @channelname.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      (nextErrors.contact ? contactInput : channelInput).current?.focus();
      return;
    }

    if (!selectedPlan) { setSubmitError("Выберите тариф."); return; }
    const payload = { email: contact.trim(), channel: normalizedLink!, plan: selectedPlanLabel, planId: selectedPlan.id, source: "telegram-follow" };
    const signature = JSON.stringify(payload);
    if (submission.current?.payload !== signature) submission.current = { payload: signature, token: crypto.randomUUID() };
    setIsSubmitting(true);
    try {
      const response = await fetch(leadEndpoint, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...payload, submissionToken: submission.current.token, supportsYooKassa: true })
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error("Сохранение не подтверждено");
      if (!leadSuccessTracked.current) leadSuccessTracked.current = trackLeadGoal("tg_lead_success");
      const amount = Number(selectedPlan.price.replace(/\D/g, ""));
      const provider = result.paymentProvider === "bank" || result.paymentProvider === "prodamus" ||
        result.paymentProvider === "payanyway" || result.paymentProvider === "yookassa" ? result.paymentProvider : undefined;
      const statuses = provider === "yookassa" ? ["Не проверена", "Оплачено", "Отменена", "Тестовая оплата"] : ["Не проверена", "Оплачено"];
      if (typeof result.requestId === "string" && /^TG-[A-Z0-9-]{6,40}$/.test(result.requestId) && result.amount === amount && statuses.includes(result.paymentStatus)) {
        let paymentUrl: string | undefined;
        if ((provider === "prodamus" || provider === "yookassa") && typeof result.paymentUrl === "string") {
          try {
            const url = new URL(result.paymentUrl);
            const allowedOrigins = provider === "yookassa" ? ["https://yoomoney.ru", "https://yookassa.ru"] : ["https://realbuzz.payform.ru"];
            if (url.protocol === "https:" && allowedOrigins.includes(url.origin) && !url.username && !url.password) paymentUrl = url.href;
          } catch { /* A malformed payment URL must never become a link. */ }
        }
        setSavedOrder({ requestId: result.requestId, amount, plan: selectedPlanLabel,
          provider, providerLocked: result.paymentProviderLocked === true,
          paymentForm: validatePayAnyWayForm(result.paymentForm, result.requestId, amount),
          paymentUrl, paymentStatus: result.paymentStatus });
        try {
          sessionStorage.setItem("prodamus.order." + result.requestId, JSON.stringify({
            requestId: result.requestId, amount, plan: selectedPlanLabel,
            token: submission.current.token, createdAt: Date.now()
          }));
        } catch { /* The return page offers support if browser storage is unavailable. */ }
      }
      setIsSent(true);
    } catch {
      setSubmitError("Не удалось подтвердить сохранение заявки. Повторите отправку или напишите на realbuzzmanager@yandex.ru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectPlan = (plan: PricingPlan) => {
    onSelectPlan(plan);
    if (planPicker.current) planPicker.current.open = false;
    planSummary.current?.focus({ preventScroll: true });
  };

  return (
    <section id="lead-form" className="section-pad lead-section">
      <div className="container-shell lead-grid">
        <div className="lead-intro">
          <h2 className="section-title">Заказать услугу</h2>
        </div>

        {isSent ? (
          <div className="lead-card">
            <div className="order-result" ref={successPanel} role="status" tabIndex={-1}>
              {savedOrder ? <PaymentDetails order={savedOrder} /> : <p>Заявка сохранена. Реквизиты оплаты сейчас недоступны. Напишите на <a href="mailto:realbuzzmanager@yandex.ru">realbuzzmanager@yandex.ru</a> — поможем с оплатой. Повторно отправлять заявку не нужно.</p>}
            </div>
          </div>
        ) : (
          <form
            className="lead-card ym-disable-submit"
            onClickCapture={trackFormStart}
            onFocusCapture={trackFormStart}
            onKeyDownCapture={trackFormStart}
            onChangeCapture={trackFormStart}
            onSubmit={handleSubmit}
            noValidate
          >
            <input type="hidden" name="plan" value={selectedPlanLabel} />
            <details className="plan-picker" ref={planPicker}>
              <summary ref={planSummary} className="focus-ring">
                <span className="plan-summary-copy">
                  <span className="plan-summary-label">Выбранный тариф</span>
                  <strong>{selectedPlan ? `${selectedPlan.name} · ${selectedPlan.price}` : "Без выбора тарифа"}</strong>
                  {selectedPlan ? <span className="plan-summary-meta">{selectedPlan.subscribers} · {selectedPlan.period}</span> : null}
                </span>
                <span className="plan-change">{selectedPlan ? "Изменить" : "Выбрать"}<span aria-hidden="true">↓</span></span>
              </summary>
              <div className="plan-options" role="group" aria-label="Выберите тариф">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    className="plan-option focus-ring"
                    aria-pressed={selectedPlan?.id === plan.id}
                    disabled={isSubmitting}
                    onClick={() => selectPlan(plan)}
                  >
                    <span className="plan-option-check"><CheckIcon /></span>
                    <span><strong>{plan.name}</strong><small>{plan.subscribers}</small></span>
                    <strong className="plan-option-price">{plan.price}</strong>
                  </button>
                ))}
              </div>
            </details>

            <div className="lead-fields">
              <div>
                <label htmlFor="contact">Ваши контакты</label>
                <input
                  ref={contactInput}
                  id="contact"
                  name="email"
                  type="text"
                  autoComplete="off"
                  inputMode="text"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  className="form-input ym-disable-keys"
                  placeholder="Ваш @username в Telegram"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.contact)}
                  aria-describedby={errors.contact ? "contact-error" : undefined}
                />
                {errors.contact ? <p id="contact-error" className="field-error">{errors.contact}</p> : null}
              </div>
              <div>
                <label htmlFor="channel">Ссылка на Telegram-канал</label>
                <input
                  ref={channelInput}
                  id="channel"
                  name="channel"
                  type="text"
                  autoComplete="off"
                  inputMode="url"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="send"
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
                  className="form-input ym-disable-keys"
                  placeholder="t.me/channel или @channelname"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.channel)}
                  aria-describedby={errors.channel ? "channel-error" : undefined}
                />
                {errors.channel ? <p id="channel-error" className="field-error">{errors.channel}</p> : null}
              </div>
            </div>
            {submitError ? <p className="field-error" role="alert">{submitError}</p> : null}
            <button className="btn-primary lead-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Отправляем..." : "Отправить заявку"}
            </button>
            <p className="mt-4 text-sm leading-6 text-slate-600">Данные заявки нужны для связи и обсуждения заказа. <a className="underline" href="/privacy/">Политика обработки данных</a>. Условия заказа описаны в <a className="underline" href="/offer/">оферте</a>.</p>
          </form>
        )}
      </div>
    </section>
  );
}
