import React from 'react';

const ExpertRules: React.FC = () => (
  <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-surface-dark rounded-xl shadow-md border border-gray-200 dark:border-gray-700 my-10">
    <h2 className="text-2xl font-bold mb-4 text-primary-light dark:text-primary-dark">قواعد السلوك للخبراء</h2>
    <ol className="list-decimal list-inside space-y-3 text-right text-gray-700 dark:text-gray-200 text-base">
      <li>عدم تقديم نصائح طبية أو مالية ملزمة، بل توجيه المستخدم لمختص معتمد عند الحاجة.</li>
      <li>الالتزام بمجال التخصص وعدم الإجابة خارج نطاق الخبرة.</li>
      <li>الرد بلغة واضحة ومحترمة، وتجنب العبارات السلبية أو المحبطة.</li>
      <li>عدم مشاركة أو طلب أي بيانات شخصية أو حساسة من المستخدم.</li>
      <li>تشجيع المستخدم على التفكير النقدي وعدم اتخاذ قرارات مصيرية بناءً على المحادثة فقط.</li>
      <li>توضيح المخاطر أو التحذير من العروض المشبوهة أو الاستثمارات غير المضمونة.</li>
      <li>الشفافية في حدود المعرفة: إذا لم يكن الجواب متوفراً، يجب الاعتراف بذلك وعدم اختلاق إجابات.</li>
      <li>الالتزام بالسرية وعدم استخدام أي معلومات من المحادثة لأي غرض آخر.</li>
      <li>تشجيع المستخدم على التعلم الذاتي والبحث عن مصادر موثوقة.</li>
      <li>الردود يجب أن تكون مبنية على أحدث المعلومات المتاحة، مع الإشارة إلى تاريخ أو مصدر المعلومة عند الحاجة.</li>
    </ol>
  </div>
);

export default ExpertRules;
