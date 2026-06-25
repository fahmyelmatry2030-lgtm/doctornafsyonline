module.exports=[982793,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(285888),e=a.i(343419),f=a.i(423120),f=f,g=a.i(536670);a.s(["ShiftLeaderDashboard",0,function(){let[a,h]=(0,c.useState)(null),[i,j]=(0,c.useState)(!0),[k,l]=(0,c.useState)(null),[m,n]=(0,c.useState)(!1),[o,p]=(0,c.useState)(null),[q,r]=(0,c.useState)(!1),[s,t]=(0,c.useState)(!1),[u,v]=(0,c.useState)("summary");(0,c.useEffect)(()=>{w();let a=setInterval(w,3e4);return()=>clearInterval(a)},[]);let w=async()=>{try{j(!0),p(null);let a=await fetch("/api/admin/shift-leader",{method:"GET",headers:{"Content-Type":"application/json"}});if(!a.ok){let b=await a.json().catch(()=>null);throw Error(b?.error||"فشل تحميل البيانات")}let b=await a.json();if(!b.success)throw Error(b.error||"فشل تحميل البيانات");h({totalSpecialists:b.totalSpecialists,onlineSpecialists:b.onlineSpecialists,totalSessions:b.totalSessions,totalEarnings:b.totalEarnings,totalCommissions:b.totalCommissions,team:b.team,assignedShift:b.assignedShift||null})}catch(b){let a=b instanceof Error?b.message:"حدث خطأ غير متوقع";console.error("Error fetching data:",b),p(a)}finally{j(!1)}},x=async()=>{if(k)try{r(!0);let a=!k.isOnline;if(!(await fetch("/api/admin/specialist-status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({specialistId:k.specialistId,isOnline:a})})).ok)throw Error("فشل تحديث الحالة");l({...k,isOnline:a}),await w()}catch(b){let a=b instanceof Error?b.message:"حدث خطأ";console.error("Error toggling status:",b),p(a)}finally{r(!1)}};return i?(0,b.jsx)("div",{className:"text-center py-8",children:"جاري التحميل..."}):a?(0,b.jsxs)("div",{className:"animate-fade-in space-y-6",children:[(0,b.jsxs)("div",{className:"bg-white rounded-[24px] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-slate-100",children:[(0,b.jsx)("div",{className:"absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"}),(0,b.jsx)("div",{className:"absolute left-0 bottom-0 w-64 h-64 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"}),(0,b.jsxs)("div",{className:"z-10",children:[(0,b.jsx)("h1",{className:"text-2xl font-black text-[#2B3674] mb-2 flex items-center gap-2",children:"لوحة تحكم قائد الشيفت 📊"}),(0,b.jsx)("p",{className:"text-[#A3AED0] font-medium text-sm max-w-lg",children:"تابع أداء الفريق، الحالة اليومية للأخصائيين، وتقارير الشيفت من لوحة تحكم واحدة مُنسقة مثل لوحة الأدمين."})]}),(0,b.jsx)("div",{className:"hidden md:flex items-center gap-4 z-10",children:(0,b.jsxs)("div",{className:"bg-[#F4F7FE] px-5 py-3 rounded-2xl",children:[(0,b.jsx)("p",{className:"text-xs text-[#A3AED0] font-bold mb-1",children:"تاريخ اليوم"}),(0,b.jsx)("p",{className:"text-sm font-black text-[#2B3674]",children:new Date().toLocaleDateString("ar-EG",{weekday:"long",year:"numeric",month:"long",day:"numeric"})})]})})]}),a.assignedShift&&(0,b.jsxs)("div",{className:"bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm",children:[(0,b.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-black text-[#2B3674]",children:"الشيفت المعين لك"}),(0,b.jsxs)("p",{className:"text-sm text-slate-500 mt-2",children:[(0,b.jsx)("strong",{className:"text-slate-700",children:a.assignedShift.name})," — ",a.assignedShift.dayOfWeek]})]}),(0,b.jsxs)("div",{className:"text-right",children:[(0,b.jsxs)("p",{className:"text-sm font-semibold text-slate-600",children:[a.assignedShift.startTime," — ",a.assignedShift.endTime]}),!a.assignedShift.isActive&&(0,b.jsx)("p",{className:"text-xs text-rose-600 mt-2 font-bold",children:"حالة الشيفت: غير مفعل"})]})]}),a.assignedShift.description&&(0,b.jsx)("p",{className:"text-sm text-slate-400 mt-4 leading-relaxed",children:a.assignedShift.description})]}),(0,b.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5",children:[(0,b.jsx)("div",{className:"bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group",children:(0,b.jsxs)("div",{className:"flex items-center justify-between",children:[(0,b.jsx)("div",{className:"w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0",children:(0,b.jsx)("span",{className:"w-3.5 h-3.5 rounded-full bg-emerald-600 animate-pulse"})}),(0,b.jsxs)("div",{className:"text-left",children:[(0,b.jsx)("p",{className:"text-sm font-bold text-[#A3AED0] mb-1",children:"أونلاين الآن"}),(0,b.jsx)("p",{className:"text-3xl font-black text-[#2B3674]",children:a.onlineSpecialists}),(0,b.jsxs)("p",{className:"text-[10px] font-bold text-[#A3AED0] mt-1",children:["من أصل ",a.totalSpecialists]})]})]})}),(0,b.jsx)("div",{className:"bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group",children:(0,b.jsxs)("div",{className:"flex items-center justify-between",children:[(0,b.jsx)("div",{className:"w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0",children:(0,b.jsx)(d.Users,{size:24})}),(0,b.jsxs)("div",{className:"text-left",children:[(0,b.jsx)("p",{className:"text-sm font-bold text-[#A3AED0] mb-1",children:"الجلسات اليوم"}),(0,b.jsx)("p",{className:"text-3xl font-black text-[#2B3674]",children:a.totalSessions})]})]})}),(0,b.jsx)("div",{className:"bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group",children:(0,b.jsxs)("div",{className:"flex items-center justify-between",children:[(0,b.jsx)("div",{className:"w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0",children:(0,b.jsx)(e.TrendingUp,{size:24})}),(0,b.jsxs)("div",{className:"text-left",children:[(0,b.jsx)("p",{className:"text-sm font-bold text-[#A3AED0] mb-1",children:"عمولتك اليومية"}),(0,b.jsx)("p",{className:"text-3xl font-black text-[#2B3674]",children:a.totalCommissions}),(0,b.jsx)("p",{className:"text-[10px] font-bold text-slate-400 mt-1",children:"ج.م"})]})]})})]}),(0,b.jsxs)("div",{className:"bg-white rounded-[24px] p-7 shadow-sm border border-slate-100",children:[(0,b.jsxs)("div",{className:"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-black text-[#2B3674]",children:"📋 التقارير والطباعة"}),(0,b.jsx)("p",{className:"text-sm text-[#A3AED0] mt-1",children:"اختر نوع التقرير ثم قم بالطباعة أو التحميل بصيغة Excel."})]}),(0,b.jsxs)("div",{className:"flex flex-col sm:flex-row gap-3 w-full lg:w-auto",children:[(0,b.jsxs)("button",{onClick:()=>{var b,c,d,e,f,g,h,i,j;let k,l=window.open("","_blank");if(!l||!a)return;let m=new Date().toLocaleDateString("ar-EG"),n=new Date().toLocaleTimeString("ar-EG"),o="";o="summary"===u?(b=a,c=m,d=n,`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير ملخص القيادة</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 26px; }
          .print-info { margin-top: 10px; font-size: 12px; color: #666; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 30px 0; }
          .stat-box { border: 2px solid #0066cc; padding: 12px; border-radius: 6px; text-align: center; background: #f8f9ff; }
          .stat-value { font-size: 24px; font-weight: bold; color: #0066cc; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #0066cc; color: white; padding: 12px; text-align: right; }
          td { padding: 10px; border: 1px solid #ddd; }
          tr:nth-child(even) { background: #f9f9f9; }
          .online { color: #22aa22; font-weight: bold; }
          .offline { color: #cc2222; font-weight: bold; }
          .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; color: #0066cc; border-bottom: 2px solid #0066cc; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير ملخص القيادة - الشيفت</h1>
          <div class="print-info">التاريخ: ${c} | الوقت: ${d}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">${b.onlineSpecialists}</div>
            <div class="stat-label">🟢 أونلاين الآن</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${b.totalSpecialists}</div>
            <div class="stat-label">📊 إجمالي الأخصائيين</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${b.totalSessions}</div>
            <div class="stat-label">📞 إجمالي الجلسات</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${b.totalCommissions}</div>
            <div class="stat-label">💰 عمولتك (ج.م)</div>
          </div>
        </div>

        <div class="section-title">ملخص الأخصائيين</div>
        <table>
          <tr>
            <th>الحالة</th>
            <th>الجلسات</th>
            <th>العمولة (ج.م)</th>
            <th>الاسم</th>
          </tr>
          ${b.team.map(a=>`
            <tr>
              <td><span class="${a.isOnline?"online":"offline"}">${a.isOnline?"🟢 أونلاين":"🔴 أوفلاين"}</span></td>
              <td>${a.appointmentsToday}</td>
              <td>${a.commissionEarnings}</td>
              <td><strong>${a.specialistName}</strong></td>
            </tr>
          `).join("")}
        </table>
        <div class="footer"><p>\xa9 تطبيق نفسي - لوحة تحكم قائد الشيفت</p></div>
      </body>
      </html>
    `):"specialists"===u?(e=a,f=m,g=n,`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الأخصائيين التفصيلي</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 26px; }
          .print-info { margin-top: 10px; font-size: 12px; color: #666; }
          .specialist-section { page-break-inside: avoid; margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 6px; background: #fafafa; }
          .specialist-name { font-size: 16px; font-weight: bold; color: #0066cc; margin-bottom: 10px; }
          .status { padding: 5px 10px; border-radius: 4px; display: inline-block; font-weight: bold; margin-bottom: 10px; }
          .online { background: #d4edda; color: #155724; }
          .offline { background: #f8d7da; color: #721c24; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
          th { background: #0066cc; color: white; padding: 8px; text-align: right; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background: #fff; }
          h3 { margin: 15px 0 10px 0; color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; font-size: 13px; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الأخصائيين التفصيلي</h1>
          <div class="print-info">التاريخ: ${f} | الوقت: ${g}</div>
        </div>

        ${e.team.map(a=>`
          <div class="specialist-section">
            <div class="specialist-name">${a.specialistName}</div>
            <span class="status ${a.isOnline?"online":"offline"}">
              ${a.isOnline?"🟢 أونلاين":"🔴 أوفلاين"}
            </span>
            
            <table>
              <tr><th>البيان</th><th>القيمة</th></tr>
              <tr><td>الجلسات اليوم</td><td><strong>${a.appointmentsToday}</strong></td></tr>
              <tr><td>عمولتك (ج.م)</td><td><strong>${a.commissionEarnings}</strong></td></tr>
            </table>
            
            ${a.sessions.length>0?`
              <h3>جلسات اليوم (${a.sessions.length})</h3>
              <table>
                <tr><th>المريض</th><th>الوقت</th><th>الحالة</th></tr>
                ${a.sessions.map(a=>`
                  <tr>
                    <td>${a.patientName}</td>
                    <td>${new Date(a.scheduledAt).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"})}</td>
                    <td>${a.sessionStatus}</td>
                  </tr>
                `).join("")}
              </table>
            `:'<p style="color: #999; margin: 10px 0;">لا توجد جلسات</p>'}
          </div>
        `).join("")}

        <div class="footer"><p>\xa9 تطبيق نفسي - لوحة تحكم قائد الشيفت</p></div>
      </body>
      </html>
    `):(h=a,i=m,j=n,k=h.team.flatMap(a=>a.sessions.map(b=>({...b,specialistName:a.specialistName}))),`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقرير المرضى والجلسات</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 26px; }
          .print-info { margin-top: 10px; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #0066cc; color: white; padding: 12px; text-align: right; font-weight: bold; font-size: 13px; }
          td { padding: 10px; border: 1px solid #ddd; font-size: 12px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير المرضى والجلسات الشامل</h1>
          <div class="print-info">التاريخ: ${i} | الوقت: ${j} | إجمالي الجلسات: ${k.length}</div>
        </div>

        <table>
          <tr>
            <th>الأخصائي</th>
            <th>المريض</th>
            <th>البريد الإلكتروني</th>
            <th>الهاتف</th>
            <th>الوقت</th>
            <th>الحالة</th>
          </tr>
          ${k.map(a=>`
            <tr>
              <td>${a.specialistName}</td>
              <td>${a.patientName}</td>
              <td>${a.patientEmail}</td>
              <td>${a.patientPhone||"-"}</td>
              <td>${new Date(a.scheduledAt).toLocaleString("ar-EG",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}</td>
              <td>${a.sessionStatus}</td>
            </tr>
          `).join("")}
        </table>

        <div class="footer"><p>\xa9 تطبيق نفسي - لوحة تحكم قائد الشيفت</p></div>
      </body>
      </html>
    `),l.document.write(o),l.document.close(),l.print()},className:"flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4318FF] text-white rounded-2xl hover:bg-[#2B12D3] transition font-semibold w-full sm:w-auto shadow-sm text-sm",children:[(0,b.jsx)(f.default,{size:18}),"طباعة التقرير"]}),(0,b.jsxs)("button",{onClick:()=>{let b,c,d,e;c=new Blob([(b="الاسم,الحالة,الجلسات,الأرباح,العمولة\n",a.team.forEach(a=>{b+=`${a.specialistName},${a.isOnline?"أونلاين":"أوفلاين"},${a.appointmentsToday},${a.totalEarnings},${a.commissionEarnings}
`}),b)],{type:"text/csv;charset=utf-8;"}),d=document.createElement("a"),e=URL.createObjectURL(c),d.setAttribute("href",e),d.setAttribute("download",`shift-leader-report-${new Date().toISOString().split("T")[0]}.csv`),d.click()},className:"flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10B981] text-white rounded-2xl hover:bg-[#0F9A6E] transition font-semibold w-full sm:w-auto shadow-sm text-sm",children:[(0,b.jsx)(g.Download,{size:18}),"تحميل Excel"]})]})]}),(0,b.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3",children:[(0,b.jsxs)("label",{className:"flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition min-w-0",children:[(0,b.jsx)("input",{type:"radio",name:"reportType",value:"summary",checked:"summary"===u,onChange:a=>v(a.target.value),className:"w-4 h-4 text-[#4318FF]"}),(0,b.jsx)("span",{className:"font-bold text-slate-700 truncate text-sm",children:"📊 ملخص عام"})]}),(0,b.jsxs)("label",{className:"flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition min-w-0",children:[(0,b.jsx)("input",{type:"radio",name:"reportType",value:"specialists",checked:"specialists"===u,onChange:a=>v(a.target.value),className:"w-4 h-4 text-[#4318FF]"}),(0,b.jsx)("span",{className:"font-bold text-slate-700 truncate text-sm",children:"👨‍⚕️ الأخصائيين"})]}),(0,b.jsxs)("label",{className:"flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition min-w-0",children:[(0,b.jsx)("input",{type:"radio",name:"reportType",value:"patients",checked:"patients"===u,onChange:a=>v(a.target.value),className:"w-4 h-4 text-[#4318FF]"}),(0,b.jsx)("span",{className:"font-bold text-slate-700 truncate text-sm",children:"🤒 المرضى"})]})]}),(0,b.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-slate-100",children:[(0,b.jsxs)("label",{className:"flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-[#4318FF] rounded-2xl cursor-pointer hover:bg-indigo-100 transition font-bold text-xs",children:[(0,b.jsx)("input",{type:"checkbox",checked:s,onChange:a=>t(a.target.checked),className:"w-4 h-4 rounded text-[#4318FF]"}),(0,b.jsx)("span",{children:"🟢 الأونلاين فقط"})]}),(0,b.jsx)("div",{className:"text-xs font-semibold text-slate-400",children:s?"يتم عرض الأخصائيين الأونلاين فقط في الجدول":"يتم عرض جميع الأخصائيين المسجلين في الجدول"})]})]}),(0,b.jsxs)("div",{className:"bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm",children:[(0,b.jsx)("div",{className:"px-6 py-5 border-b border-slate-100 flex items-center justify-between",children:(0,b.jsxs)("h2",{className:"text-lg font-black text-[#2B3674]",children:["فريقك (",a.totalSpecialists," أخصائي)"]})}),(0,b.jsx)("div",{className:"overflow-x-auto",children:(0,b.jsxs)("table",{className:"w-full text-sm text-right",children:[(0,b.jsx)("thead",{className:"bg-slate-50 text-[#A3AED0] uppercase tracking-wide text-xs border-b border-slate-100",children:(0,b.jsxs)("tr",{children:[(0,b.jsx)("th",{className:"px-6 py-4 font-bold",children:"الحالة"}),(0,b.jsx)("th",{className:"px-6 py-4 font-bold",children:"الجلسات"}),(0,b.jsx)("th",{className:"px-6 py-4 font-bold",children:"العمولة"}),(0,b.jsx)("th",{className:"px-6 py-4 font-bold",children:"الاسم"}),(0,b.jsx)("th",{className:"px-6 py-4 text-center font-bold",children:"التفاصيل"})]})}),(0,b.jsx)("tbody",{className:"divide-y divide-slate-50",children:a.team.filter(a=>!s||a.isOnline).map(a=>(0,b.jsxs)("tr",{className:"hover:bg-slate-50/50 transition-colors",children:[(0,b.jsx)("td",{className:"px-6 py-4",children:(0,b.jsxs)("span",{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${a.isOnline?"bg-emerald-50 text-emerald-600 border border-emerald-100":"bg-rose-50 text-rose-600 border border-rose-100"} border`,children:[(0,b.jsx)("span",{className:`w-2 h-2 rounded-full ${a.isOnline?"bg-emerald-500":"bg-rose-500"}`}),a.isOnline?"أونلاين":"أوفلاين"]})}),(0,b.jsx)("td",{className:"px-6 py-4 text-slate-700 font-semibold",children:a.appointmentsToday}),(0,b.jsxs)("td",{className:"px-6 py-4 text-[#4318FF] font-bold",children:[a.commissionEarnings," ج.م"]}),(0,b.jsx)("td",{className:"px-6 py-4 text-[#2B3674] font-bold",children:a.specialistName}),(0,b.jsx)("td",{className:"px-6 py-4 text-center",children:(0,b.jsx)("button",{onClick:()=>{l(a),n(!0)},className:"text-[#4318FF] hover:text-[#2B12D3] font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl transition",children:"عرض التفاصيل"})})]},a.specialistId))})]})})]}),m&&k&&(0,b.jsx)("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:(0,b.jsxs)("div",{className:"bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col",children:[(0,b.jsxs)("div",{className:"flex items-center justify-between border-b p-6",children:[(0,b.jsxs)("div",{className:"flex-1",children:[(0,b.jsx)("h2",{className:"text-2xl font-bold text-slate-900",children:k.specialistName}),(0,b.jsx)("p",{className:`text-sm mt-1 ${k.isOnline?"text-green-600":"text-red-600"}`,children:k.isOnline?"🟢 متاح الآن":"🔴 غير متاح حالياً"})]}),(0,b.jsxs)("div",{className:"flex gap-2",children:[(0,b.jsx)("button",{onClick:x,disabled:q,className:`flex items-center gap-1 px-3 py-2 rounded text-sm font-semibold transition ${k.isOnline?"bg-red-100 text-red-600 hover:bg-red-200":"bg-green-100 text-green-600 hover:bg-green-200"} disabled:opacity-50 disabled:cursor-not-allowed`,children:k.isOnline?"🔴 تعطيل":"🟢 تفعيل"}),(0,b.jsxs)("button",{onClick:()=>{let a=window.open("","_blank");if(!a)return;let b=`
                      <!DOCTYPE html>
                      <html dir="rtl">
                      <head>
                        <meta charset="UTF-8">
                        <title>تقرير الأخصائي</title>
                        <style>
                          body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
                          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                          .info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
                          .info-box { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
                          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                          th { background: #f0f0f0; padding: 8px; text-align: right; border: 1px solid #ddd; }
                          td { padding: 8px; border: 1px solid #ddd; }
                          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #999; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1>تقرير الأخصائي</h1>
                          <p>${k.specialistName}</p>
                        </div>
                        <div class="info">
                          <div class="info-box">
                            <strong>الحالة:</strong>
                            <p>${k.isOnline?"أونلاين":"أوفلاين"}</p>
                          </div>
                          <div class="info-box">
                            <strong>الجلسات اليوم:</strong>
                            <p>${k.appointmentsToday}</p>
                          </div>
                          <div class="info-box">
                            <strong>العمولة:</strong>
                            <p>${k.commissionEarnings} ج.م</p>
                          </div>
                        </div>
                        <h3>تفاصيل الجلسات:</h3>
                        <table>
                          <tr>
                            <th>المريض</th>
                            <th>التاريخ والوقت</th>
                            <th>المدة</th>
                            <th>الحالة</th>
                          </tr>
                          ${k.sessions.map(a=>`
                            <tr>
                              <td>${a.patientName}</td>
                              <td>${new Date(a.scheduledAt).toLocaleString("ar-EG")}</td>
                              <td>${a.duration} دقيقة</td>
                              <td>${a.sessionStatus}</td>
                            </tr>
                          `).join("")}
                        </table>
                        <div class="footer">
                          <p>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-EG")}</p>
                          <p>\xa9 تطبيق نفسي - لوحة تحكم القيادة</p>
                        </div>
                      </body>
                      </html>
                    `;a.document.write(b),a.document.close(),a.print()},className:"flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm",children:[(0,b.jsx)(f.default,{size:16}),"طباعة"]}),(0,b.jsx)("button",{onClick:()=>n(!1),className:"p-2 hover:bg-slate-100 rounded-lg",children:"✕"})]})]}),(0,b.jsxs)("div",{className:"flex-1 overflow-y-auto p-6 space-y-6",children:[(0,b.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3",children:[(0,b.jsxs)("div",{className:"bg-blue-50 p-3 rounded-lg",children:[(0,b.jsx)("p",{className:"text-xs text-slate-600",children:"الحالة"}),(0,b.jsx)("p",{className:`text-lg font-bold mt-1 ${k.isOnline?"text-green-600":"text-red-600"}`,children:k.isOnline?"أونلاين":"أوفلاين"})]}),(0,b.jsxs)("div",{className:"bg-green-50 p-3 rounded-lg",children:[(0,b.jsx)("p",{className:"text-xs text-slate-600",children:"الجلسات"}),(0,b.jsx)("p",{className:"text-lg font-bold text-green-600 mt-1",children:k.appointmentsToday})]}),(0,b.jsxs)("div",{className:"bg-orange-50 p-3 rounded-lg",children:[(0,b.jsx)("p",{className:"text-xs text-slate-600",children:"العمولة"}),(0,b.jsx)("p",{className:"text-lg font-bold text-orange-600 mt-1",children:k.commissionEarnings})]})]}),k.sessions.length>0?(0,b.jsxs)("div",{children:[(0,b.jsxs)("h3",{className:"font-bold text-slate-900 mb-3",children:["تفاصيل الجلسات (",k.sessions.length,")"]}),(0,b.jsx)("div",{className:"overflow-x-auto border rounded-lg",children:(0,b.jsxs)("table",{className:"w-full text-sm",children:[(0,b.jsx)("thead",{className:"bg-slate-100",children:(0,b.jsxs)("tr",{children:[(0,b.jsx)("th",{className:"px-4 py-2 text-right",children:"المريض"}),(0,b.jsx)("th",{className:"px-4 py-2 text-right",children:"البريد"}),(0,b.jsx)("th",{className:"px-4 py-2 text-right",children:"الوقت"}),(0,b.jsx)("th",{className:"px-4 py-2 text-right",children:"الحالة"})]})}),(0,b.jsx)("tbody",{className:"divide-y",children:k.sessions.map(a=>(0,b.jsxs)("tr",{className:"hover:bg-slate-50",children:[(0,b.jsx)("td",{className:"px-4 py-2",children:a.patientName}),(0,b.jsx)("td",{className:"px-4 py-2 text-xs",children:a.patientEmail}),(0,b.jsx)("td",{className:"px-4 py-2 text-xs",children:new Date(a.scheduledAt).toLocaleString("ar-EG",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}),(0,b.jsx)("td",{className:"px-4 py-2",children:(0,b.jsx)("span",{className:`text-xs px-2 py-1 rounded ${"COMPLETED"===a.sessionStatus?"bg-green-100 text-green-700":"IN_PROGRESS"===a.sessionStatus?"bg-blue-100 text-blue-700":"bg-yellow-100 text-yellow-700"}`,children:a.sessionStatus})})]},a.id))})]})})]}):(0,b.jsx)("p",{className:"text-center text-slate-500",children:"لا توجد جلسات اليوم"})]})]})})]}):(0,b.jsx)("div",{className:"text-red-600",children:"خطأ في تحميل البيانات"})}],982793)}];

//# sourceMappingURL=src_components_ShiftLeaderDashboard_tsx_11abil9._.js.map