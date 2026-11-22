
'use strict';

(() => {
  const $ = (id) => document.getElementById(id);
  const topic = $('topic');
  const kind = $('kind');
  const result = $('result');
  const saved = $('saved');
  const make = $('make');
  const copy = $('copy');
  const save = $('save');
  let activeTool = 'ideas';
  let currentDraft = '';

  const toolNames = {
    ideas: 'أفكار محتوى',
    script: 'كتابة سيناريو',
    caption: 'وصف ومنشور',
    storyboard: 'خطة فيديو'
  };

  function buildDraft(text, platform, tool) {
    const intro = `الموضوع: ${text}\nالمنصة: ${platform}\n\n`;

    switch (tool) {
      case 'script':
        return intro + `العنوان: ${text}

المشهد 1 – جذب الانتباه (0–5 ثوانٍ):
ابدأ بسؤال أو معلومة مثيرة عن الموضوع.

المشهد 2 – الفكرة الرئيسية:
اشرح الفكرة ببساطة، مع مثال واضح.

المشهد 3 – الخلاصة:
لخّص أهم نقطة وقدم نصيحة عملية.

الخاتمة:
اطلب من المشاهد كتابة رأيه أو متابعة الحساب.

ملاحظة: هذه مسودة أولية وليست مولدة بنموذج ذكاء اصطناعي.`;

      case 'caption':
        return intro + `${text}

ما رأيكم؟ شاركونا آراءكم وتجاربكم في التعليقات.

#صناعة_المحتوى #محتوى_عربي

ملاحظة: عدّل النص والوسوم بما يناسب منشورك.`;

      case 'storyboard':
        return intro + `خطة الفيديو المقترحة:

1. الافتتاحية: لقطة قريبة مع عنوان جذاب.
2. تقديم الموضوع: لقطة توضح الفكرة الأساسية.
3. التفاصيل: لقطات داعمة وأمثلة.
4. النتيجة: عرض الخلاصة أو الحل.
5. النهاية: دعوة للتفاعل والمتابعة.

أضف تعليقاً صوتياً وموسيقى مرخصة.

ملاحظة: هذه خطة تصوير نصية وليست فيديو جاهزاً.`;

      default:
        return intro + `أفكار يمكنك تطويرها:

1. شرح الموضوع للمبتدئين.
2. أكثر 5 أخطاء شائعة.
3. حقيقة قد لا يعرفها الجمهور.
4. خطوات عملية للاستفادة من الموضوع.
5. مقارنة بين طريقتين.

اختر فكرة واحدة وابدأ بمقدمة تشد الانتباه.

ملاحظة: هذه اقتراحات أولية وليست توليداً فعلياً بالذكاء الاصطناعي.`;
    }
  }

  document.querySelectorAll('[data-tool]').forEach(button => {
    button.addEventListener('click', () => {
      activeTool = button.dataset.tool;
      document.querySelectorAll('[data-tool]').forEach(item =>
        item.setAttribute('aria-pressed', String(item === button))
      );
      result.textContent = `تم اختيار: ${toolNames[activeTool]}. اكتب موضوعك ثم اضغط جهّز المسودة.`;
      topic.focus();
    });
  });

  make.addEventListener('click', () => {
    const text = topic.value.trim();
    if (!text) {
      result.textContent = 'اكتب موضوع المحتوى أولاً.';
      topic.focus();
      return;
    }
    currentDraft = buildDraft(text, kind.value, activeTool);
    result.textContent = currentDraft;
  });

  copy.addEventListener('click', async () => {
    const text = currentDraft || result.textContent;
    if (!text || text === 'ستظهر المسودة هنا.') {
      result.textContent = 'جهّز مسودة أولاً.';
      return;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        const ok = document.execCommand('copy');
        temp.remove();
        if (!ok) throw new Error('copy failed');
      }
      result.textContent = text + '\n\n✓ تم نسخ النص.';
    } catch (_) {
      result.textContent = text + '\n\nاضغط مطولاً على النص واختر نسخ.';
    }
  });

  function readDrafts() {
    try {
      return JSON.parse(localStorage.getItem('contentMakerDrafts') || '[]');
    } catch (_) {
      return [];
    }
  }

  function renderSaved() {
    const drafts = readDrafts();
    saved.replaceChildren();

    if (!drafts.length) {
      saved.textContent = 'لا توجد مسودات بعد.';
      return;
    }

    drafts.forEach((draft, index) => {
      const item = document.createElement('div');
      item.className = 'saved-item';

      const heading = document.createElement('strong');
      heading.textContent = `${draft.title} · ${draft.date}`;

      const body = document.createElement('p');
      body.textContent = draft.text;

      const load = document.createElement('button');
      load.type = 'button';
      load.textContent = 'فتح المسودة';
      load.addEventListener('click', () => {
        currentDraft = draft.text;
        result.textContent = draft.text;
      });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'حذف';
      remove.addEventListener('click', () => {
        const next = readDrafts();
        next.splice(index, 1);
        localStorage.setItem('contentMakerDrafts', JSON.stringify(next));
        renderSaved();
      });

      item.append(heading, body, load, document.createTextNode(' '), remove);
      saved.appendChild(item);
    });
  }

  save.addEventListener('click', () => {
    if (!currentDraft) {
      result.textContent = 'جهّز مسودة أولاً قبل حفظها.';
      return;
    }

    try {
      const drafts = readDrafts();
      drafts.unshift({
        title: topic.value.trim().slice(0, 60) || toolNames[activeTool],
        date: new Date().toLocaleString('ar'),
        text: currentDraft
      });

      localStorage.setItem('contentMakerDrafts', JSON.stringify(drafts));
      renderSaved();
      result.textContent = currentDraft + '\n\n✓ تم حفظ المسودة على هذا الجهاز.';
    } catch (_) {
      result.textContent = 'تعذر الحفظ. تحقق من مساحة التخزين.';
    }
  });

  renderSaved();
})();
                   
