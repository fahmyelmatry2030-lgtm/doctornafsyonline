(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,367442,e=>{"use strict";let t=(0,e.i(456420).default)("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);e.s(["default",0,t])},762368,e=>{"use strict";let t=(0,e.i(456420).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",0,t],762368)},7219,e=>{"use strict";let t=(0,e.i(456420).default)("trending-up",[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]);e.s(["TrendingUp",0,t],7219)},701859,e=>{"use strict";var t=e.i(843476),s=e.i(271645),i=e.i(882303),a=e.i(7219),l=e.i(367442),l=l,d=e.i(762368);e.s(["ShiftLeaderDashboard",0,function(){let[e,n]=(0,s.useState)(null),[r,o]=(0,s.useState)(!0),[c,x]=(0,s.useState)(null),[p,m]=(0,s.useState)(!1),[h,g]=(0,s.useState)(null),[b,f]=(0,s.useState)(!1),[u,v]=(0,s.useState)(!1),[j,N]=(0,s.useState)("summary");(0,s.useEffect)(()=>{y();let e=setInterval(y,3e4);return()=>clearInterval(e)},[]);let y=async()=>{try{o(!0),g(null);let e=await fetch("/api/admin/shift-leader",{method:"GET",headers:{"Content-Type":"application/json"}});if(!e.ok){let t=await e.json().catch(()=>null);throw Error(t?.error||"فشل تحميل البيانات")}let t=await e.json();if(!t.success)throw Error(t.error||"فشل تحميل البيانات");n({totalSpecialists:t.totalSpecialists,onlineSpecialists:t.onlineSpecialists,totalSessions:t.totalSessions,totalEarnings:t.totalEarnings,totalCommissions:t.totalCommissions,team:t.team,assignedShift:t.assignedShift||null})}catch(t){let e=t instanceof Error?t.message:"حدث خطأ غير متوقع";console.error("Error fetching data:",t),g(e)}finally{o(!1)}},w=async()=>{if(c)try{f(!0);let e=!c.isOnline;if(!(await fetch("/api/admin/specialist-status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({specialistId:c.specialistId,isOnline:e})})).ok)throw Error("فشل تحديث الحالة");x({...c,isOnline:e}),await y()}catch(t){let e=t instanceof Error?t.message:"حدث خطأ";console.error("Error toggling status:",t),g(e)}finally{f(!1)}};return r?(0,t.jsx)("div",{className:"text-center py-8",children:"جاري التحميل..."}):e?(0,t.jsxs)("div",{className:"animate-fade-in space-y-6",children:[(0,t.jsxs)("div",{className:"bg-white rounded-[24px] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-slate-100",children:[(0,t.jsx)("div",{className:"absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"}),(0,t.jsx)("div",{className:"absolute left-0 bottom-0 w-64 h-64 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"}),(0,t.jsxs)("div",{className:"z-10",children:[(0,t.jsx)("h1",{className:"text-2xl font-black text-[#2B3674] mb-2 flex items-center gap-2",children:"لوحة تحكم قائد الشيفت 📊"}),(0,t.jsx)("p",{className:"text-[#A3AED0] font-medium text-sm max-w-lg",children:"تابع أداء الفريق، الحالة اليومية للأخصائيين، وتقارير الشيفت من لوحة تحكم واحدة مُنسقة مثل لوحة الأدمين."})]}),(0,t.jsx)("div",{className:"hidden md:flex items-center gap-4 z-10",children:(0,t.jsxs)("div",{className:"bg-[#F4F7FE] px-5 py-3 rounded-2xl",children:[(0,t.jsx)("p",{className:"text-xs text-[#A3AED0] font-bold mb-1",children:"تاريخ اليوم"}),(0,t.jsx)("p",{className:"text-sm font-black text-[#2B3674]",children:new Date().toLocaleDateString("ar-EG",{weekday:"long",year:"numeric",month:"long",day:"numeric"})})]})})]}),e.assignedShift&&(0,t.jsxs)("div",{className:"bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm",children:[(0,t.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-black text-[#2B3674]",children:"الشيفت المعين لك"}),(0,t.jsxs)("p",{className:"text-sm text-slate-500 mt-2",children:[(0,t.jsx)("strong",{className:"text-slate-700",children:e.assignedShift.name})," — ",e.assignedShift.dayOfWeek]})]}),(0,t.jsxs)("div",{className:"text-right",children:[(0,t.jsxs)("p",{className:"text-sm font-semibold text-slate-600",children:[e.assignedShift.startTime," — ",e.assignedShift.endTime]}),!e.assignedShift.isActive&&(0,t.jsx)("p",{className:"text-xs text-rose-600 mt-2 font-bold",children:"حالة الشيفت: غير مفعل"})]})]}),e.assignedShift.description&&(0,t.jsx)("p",{className:"text-sm text-slate-400 mt-4 leading-relaxed",children:e.assignedShift.description})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5",children:[(0,t.jsx)("div",{className:"bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group",children:(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsx)("div",{className:"w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0",children:(0,t.jsx)("span",{className:"w-3.5 h-3.5 rounded-full bg-emerald-600 animate-pulse"})}),(0,t.jsxs)("div",{className:"text-left",children:[(0,t.jsx)("p",{className:"text-sm font-bold text-[#A3AED0] mb-1",children:"أونلاين الآن"}),(0,t.jsx)("p",{className:"text-3xl font-black text-[#2B3674]",children:e.onlineSpecialists}),(0,t.jsxs)("p",{className:"text-[10px] font-bold text-[#A3AED0] mt-1",children:["من أصل ",e.totalSpecialists]})]})]})}),(0,t.jsx)("div",{className:"bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group",children:(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsx)("div",{className:"w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0",children:(0,t.jsx)(i.Users,{size:24})}),(0,t.jsxs)("div",{className:"text-left",children:[(0,t.jsx)("p",{className:"text-sm font-bold text-[#A3AED0] mb-1",children:"الجلسات اليوم"}),(0,t.jsx)("p",{className:"text-3xl font-black text-[#2B3674]",children:e.totalSessions})]})]})}),(0,t.jsx)("div",{className:"bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 relative overflow-hidden group",children:(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsx)("div",{className:"w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0",children:(0,t.jsx)(a.TrendingUp,{size:24})}),(0,t.jsxs)("div",{className:"text-left",children:[(0,t.jsx)("p",{className:"text-sm font-bold text-[#A3AED0] mb-1",children:"عمولتك اليومية"}),(0,t.jsx)("p",{className:"text-3xl font-black text-[#2B3674]",children:e.totalCommissions}),(0,t.jsx)("p",{className:"text-[10px] font-bold text-slate-400 mt-1",children:"ج.م"})]})]})})]}),(0,t.jsxs)("div",{className:"bg-white rounded-[24px] p-7 shadow-sm border border-slate-100",children:[(0,t.jsxs)("div",{className:"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"text-lg font-black text-[#2B3674]",children:"📋 التقارير والطباعة"}),(0,t.jsx)("p",{className:"text-sm text-[#A3AED0] mt-1",children:"اختر نوع التقرير ثم قم بالطباعة أو التحميل بصيغة Excel."})]}),(0,t.jsxs)("div",{className:"flex flex-col sm:flex-row gap-3 w-full lg:w-auto",children:[(0,t.jsxs)("button",{onClick:()=>{var t,s,i,a,l,d,n,r,o;let c,x=window.open("","_blank");if(!x||!e)return;let p=new Date().toLocaleDateString("ar-EG"),m=new Date().toLocaleTimeString("ar-EG"),h="";h="summary"===j?(t=e,s=p,i=m,`
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
          <div class="print-info">التاريخ: ${s} | الوقت: ${i}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">${t.onlineSpecialists}</div>
            <div class="stat-label">🟢 أونلاين الآن</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${t.totalSpecialists}</div>
            <div class="stat-label">📊 إجمالي الأخصائيين</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${t.totalSessions}</div>
            <div class="stat-label">📞 إجمالي الجلسات</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${t.totalCommissions}</div>
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
          ${t.team.map(e=>`
            <tr>
              <td><span class="${e.isOnline?"online":"offline"}">${e.isOnline?"🟢 أونلاين":"🔴 أوفلاين"}</span></td>
              <td>${e.appointmentsToday}</td>
              <td>${e.commissionEarnings}</td>
              <td><strong>${e.specialistName}</strong></td>
            </tr>
          `).join("")}
        </table>
        <div class="footer"><p>\xa9 تطبيق نفسي - لوحة تحكم قائد الشيفت</p></div>
      </body>
      </html>
    `):"specialists"===j?(a=e,l=p,d=m,`
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
          <div class="print-info">التاريخ: ${l} | الوقت: ${d}</div>
        </div>

        ${a.team.map(e=>`
          <div class="specialist-section">
            <div class="specialist-name">${e.specialistName}</div>
            <span class="status ${e.isOnline?"online":"offline"}">
              ${e.isOnline?"🟢 أونلاين":"🔴 أوفلاين"}
            </span>
            
            <table>
              <tr><th>البيان</th><th>القيمة</th></tr>
              <tr><td>الجلسات اليوم</td><td><strong>${e.appointmentsToday}</strong></td></tr>
              <tr><td>عمولتك (ج.م)</td><td><strong>${e.commissionEarnings}</strong></td></tr>
            </table>
            
            ${e.sessions.length>0?`
              <h3>جلسات اليوم (${e.sessions.length})</h3>
              <table>
                <tr><th>المريض</th><th>الوقت</th><th>الحالة</th></tr>
                ${e.sessions.map(e=>`
                  <tr>
                    <td>${e.patientName}</td>
                    <td>${new Date(e.scheduledAt).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"})}</td>
                    <td>${e.sessionStatus}</td>
                  </tr>
                `).join("")}
              </table>
            `:'<p style="color: #999; margin: 10px 0;">لا توجد جلسات</p>'}
          </div>
        `).join("")}

        <div class="footer"><p>\xa9 تطبيق نفسي - لوحة تحكم قائد الشيفت</p></div>
      </body>
      </html>
    `):(n=e,r=p,o=m,c=n.team.flatMap(e=>e.sessions.map(t=>({...t,specialistName:e.specialistName}))),`
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
          <div class="print-info">التاريخ: ${r} | الوقت: ${o} | إجمالي الجلسات: ${c.length}</div>
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
          ${c.map(e=>`
            <tr>
              <td>${e.specialistName}</td>
              <td>${e.patientName}</td>
              <td>${e.patientEmail}</td>
              <td>${e.patientPhone||"-"}</td>
              <td>${new Date(e.scheduledAt).toLocaleString("ar-EG",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}</td>
              <td>${e.sessionStatus}</td>
            </tr>
          `).join("")}
        </table>

        <div class="footer"><p>\xa9 تطبيق نفسي - لوحة تحكم قائد الشيفت</p></div>
      </body>
      </html>
    `),x.document.write(h),x.document.close(),x.print()},className:"flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4318FF] text-white rounded-2xl hover:bg-[#2B12D3] transition font-semibold w-full sm:w-auto shadow-sm text-sm",children:[(0,t.jsx)(l.default,{size:18}),"طباعة التقرير"]}),(0,t.jsxs)("button",{onClick:()=>{let t,s,i,a;s=new Blob([(t="الاسم,الحالة,الجلسات,الأرباح,العمولة\n",e.team.forEach(e=>{t+=`${e.specialistName},${e.isOnline?"أونلاين":"أوفلاين"},${e.appointmentsToday},${e.totalEarnings},${e.commissionEarnings}
`}),t)],{type:"text/csv;charset=utf-8;"}),i=document.createElement("a"),a=URL.createObjectURL(s),i.setAttribute("href",a),i.setAttribute("download",`shift-leader-report-${new Date().toISOString().split("T")[0]}.csv`),i.click()},className:"flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10B981] text-white rounded-2xl hover:bg-[#0F9A6E] transition font-semibold w-full sm:w-auto shadow-sm text-sm",children:[(0,t.jsx)(d.Download,{size:18}),"تحميل Excel"]})]})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3",children:[(0,t.jsxs)("label",{className:"flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition min-w-0",children:[(0,t.jsx)("input",{type:"radio",name:"reportType",value:"summary",checked:"summary"===j,onChange:e=>N(e.target.value),className:"w-4 h-4 text-[#4318FF]"}),(0,t.jsx)("span",{className:"font-bold text-slate-700 truncate text-sm",children:"📊 ملخص عام"})]}),(0,t.jsxs)("label",{className:"flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition min-w-0",children:[(0,t.jsx)("input",{type:"radio",name:"reportType",value:"specialists",checked:"specialists"===j,onChange:e=>N(e.target.value),className:"w-4 h-4 text-[#4318FF]"}),(0,t.jsx)("span",{className:"font-bold text-slate-700 truncate text-sm",children:"👨‍⚕️ الأخصائيين"})]}),(0,t.jsxs)("label",{className:"flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition min-w-0",children:[(0,t.jsx)("input",{type:"radio",name:"reportType",value:"patients",checked:"patients"===j,onChange:e=>N(e.target.value),className:"w-4 h-4 text-[#4318FF]"}),(0,t.jsx)("span",{className:"font-bold text-slate-700 truncate text-sm",children:"🤒 المرضى"})]})]}),(0,t.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-slate-100",children:[(0,t.jsxs)("label",{className:"flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-[#4318FF] rounded-2xl cursor-pointer hover:bg-indigo-100 transition font-bold text-xs",children:[(0,t.jsx)("input",{type:"checkbox",checked:u,onChange:e=>v(e.target.checked),className:"w-4 h-4 rounded text-[#4318FF]"}),(0,t.jsx)("span",{children:"🟢 الأونلاين فقط"})]}),(0,t.jsx)("div",{className:"text-xs font-semibold text-slate-400",children:u?"يتم عرض الأخصائيين الأونلاين فقط في الجدول":"يتم عرض جميع الأخصائيين المسجلين في الجدول"})]})]}),(0,t.jsxs)("div",{className:"bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm",children:[(0,t.jsx)("div",{className:"px-6 py-5 border-b border-slate-100 flex items-center justify-between",children:(0,t.jsxs)("h2",{className:"text-lg font-black text-[#2B3674]",children:["فريقك (",e.totalSpecialists," أخصائي)"]})}),(0,t.jsx)("div",{className:"overflow-x-auto",children:(0,t.jsxs)("table",{className:"w-full text-sm text-right",children:[(0,t.jsx)("thead",{className:"bg-slate-50 text-[#A3AED0] uppercase tracking-wide text-xs border-b border-slate-100",children:(0,t.jsxs)("tr",{children:[(0,t.jsx)("th",{className:"px-6 py-4 font-bold",children:"الحالة"}),(0,t.jsx)("th",{className:"px-6 py-4 font-bold",children:"الجلسات"}),(0,t.jsx)("th",{className:"px-6 py-4 font-bold",children:"العمولة"}),(0,t.jsx)("th",{className:"px-6 py-4 font-bold",children:"الاسم"}),(0,t.jsx)("th",{className:"px-6 py-4 text-center font-bold",children:"التفاصيل"})]})}),(0,t.jsx)("tbody",{className:"divide-y divide-slate-50",children:e.team.filter(e=>!u||e.isOnline).map(e=>(0,t.jsxs)("tr",{className:"hover:bg-slate-50/50 transition-colors",children:[(0,t.jsx)("td",{className:"px-6 py-4",children:(0,t.jsxs)("span",{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${e.isOnline?"bg-emerald-50 text-emerald-600 border border-emerald-100":"bg-rose-50 text-rose-600 border border-rose-100"} border`,children:[(0,t.jsx)("span",{className:`w-2 h-2 rounded-full ${e.isOnline?"bg-emerald-500":"bg-rose-500"}`}),e.isOnline?"أونلاين":"أوفلاين"]})}),(0,t.jsx)("td",{className:"px-6 py-4 text-slate-700 font-semibold",children:e.appointmentsToday}),(0,t.jsxs)("td",{className:"px-6 py-4 text-[#4318FF] font-bold",children:[e.commissionEarnings," ج.م"]}),(0,t.jsx)("td",{className:"px-6 py-4 text-[#2B3674] font-bold",children:e.specialistName}),(0,t.jsx)("td",{className:"px-6 py-4 text-center",children:(0,t.jsx)("button",{onClick:()=>{x(e),m(!0)},className:"text-[#4318FF] hover:text-[#2B12D3] font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl transition",children:"عرض التفاصيل"})})]},e.specialistId))})]})})]}),p&&c&&(0,t.jsx)("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:(0,t.jsxs)("div",{className:"bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between border-b p-6",children:[(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsx)("h2",{className:"text-2xl font-bold text-slate-900",children:c.specialistName}),(0,t.jsx)("p",{className:`text-sm mt-1 ${c.isOnline?"text-green-600":"text-red-600"}`,children:c.isOnline?"🟢 متاح الآن":"🔴 غير متاح حالياً"})]}),(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsx)("button",{onClick:w,disabled:b,className:`flex items-center gap-1 px-3 py-2 rounded text-sm font-semibold transition ${c.isOnline?"bg-red-100 text-red-600 hover:bg-red-200":"bg-green-100 text-green-600 hover:bg-green-200"} disabled:opacity-50 disabled:cursor-not-allowed`,children:c.isOnline?"🔴 تعطيل":"🟢 تفعيل"}),(0,t.jsxs)("button",{onClick:()=>{let e=window.open("","_blank");if(!e)return;let t=`
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
                          <p>${c.specialistName}</p>
                        </div>
                        <div class="info">
                          <div class="info-box">
                            <strong>الحالة:</strong>
                            <p>${c.isOnline?"أونلاين":"أوفلاين"}</p>
                          </div>
                          <div class="info-box">
                            <strong>الجلسات اليوم:</strong>
                            <p>${c.appointmentsToday}</p>
                          </div>
                          <div class="info-box">
                            <strong>العمولة:</strong>
                            <p>${c.commissionEarnings} ج.م</p>
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
                          ${c.sessions.map(e=>`
                            <tr>
                              <td>${e.patientName}</td>
                              <td>${new Date(e.scheduledAt).toLocaleString("ar-EG")}</td>
                              <td>${e.duration} دقيقة</td>
                              <td>${e.sessionStatus}</td>
                            </tr>
                          `).join("")}
                        </table>
                        <div class="footer">
                          <p>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-EG")}</p>
                          <p>\xa9 تطبيق نفسي - لوحة تحكم القيادة</p>
                        </div>
                      </body>
                      </html>
                    `;e.document.write(t),e.document.close(),e.print()},className:"flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm",children:[(0,t.jsx)(l.default,{size:16}),"طباعة"]}),(0,t.jsx)("button",{onClick:()=>m(!1),className:"p-2 hover:bg-slate-100 rounded-lg",children:"✕"})]})]}),(0,t.jsxs)("div",{className:"flex-1 overflow-y-auto p-6 space-y-6",children:[(0,t.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3",children:[(0,t.jsxs)("div",{className:"bg-blue-50 p-3 rounded-lg",children:[(0,t.jsx)("p",{className:"text-xs text-slate-600",children:"الحالة"}),(0,t.jsx)("p",{className:`text-lg font-bold mt-1 ${c.isOnline?"text-green-600":"text-red-600"}`,children:c.isOnline?"أونلاين":"أوفلاين"})]}),(0,t.jsxs)("div",{className:"bg-green-50 p-3 rounded-lg",children:[(0,t.jsx)("p",{className:"text-xs text-slate-600",children:"الجلسات"}),(0,t.jsx)("p",{className:"text-lg font-bold text-green-600 mt-1",children:c.appointmentsToday})]}),(0,t.jsxs)("div",{className:"bg-orange-50 p-3 rounded-lg",children:[(0,t.jsx)("p",{className:"text-xs text-slate-600",children:"العمولة"}),(0,t.jsx)("p",{className:"text-lg font-bold text-orange-600 mt-1",children:c.commissionEarnings})]})]}),c.sessions.length>0?(0,t.jsxs)("div",{children:[(0,t.jsxs)("h3",{className:"font-bold text-slate-900 mb-3",children:["تفاصيل الجلسات (",c.sessions.length,")"]}),(0,t.jsx)("div",{className:"overflow-x-auto border rounded-lg",children:(0,t.jsxs)("table",{className:"w-full text-sm",children:[(0,t.jsx)("thead",{className:"bg-slate-100",children:(0,t.jsxs)("tr",{children:[(0,t.jsx)("th",{className:"px-4 py-2 text-right",children:"المريض"}),(0,t.jsx)("th",{className:"px-4 py-2 text-right",children:"البريد"}),(0,t.jsx)("th",{className:"px-4 py-2 text-right",children:"الوقت"}),(0,t.jsx)("th",{className:"px-4 py-2 text-right",children:"الحالة"})]})}),(0,t.jsx)("tbody",{className:"divide-y",children:c.sessions.map(e=>(0,t.jsxs)("tr",{className:"hover:bg-slate-50",children:[(0,t.jsx)("td",{className:"px-4 py-2",children:e.patientName}),(0,t.jsx)("td",{className:"px-4 py-2 text-xs",children:e.patientEmail}),(0,t.jsx)("td",{className:"px-4 py-2 text-xs",children:new Date(e.scheduledAt).toLocaleString("ar-EG",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}),(0,t.jsx)("td",{className:"px-4 py-2",children:(0,t.jsx)("span",{className:`text-xs px-2 py-1 rounded ${"COMPLETED"===e.sessionStatus?"bg-green-100 text-green-700":"IN_PROGRESS"===e.sessionStatus?"bg-blue-100 text-blue-700":"bg-yellow-100 text-yellow-700"}`,children:e.sessionStatus})})]},e.id))})]})})]}):(0,t.jsx)("p",{className:"text-center text-slate-500",children:"لا توجد جلسات اليوم"})]})]})})]}):(0,t.jsx)("div",{className:"text-red-600",children:"خطأ في تحميل البيانات"})}],701859)}]);