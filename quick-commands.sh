#!/bin/bash

# ============================================
# Quick Commands for Customer Service
# ============================================

echo "🎯 أوامر سريعة للعمل مع Customer Service"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Show menu
show_menu() {
    echo "═════════════════════════════════════════"
    echo "اختري العملية المطلوبة:"
    echo "═════════════════════════════════════════"
    echo ""
    echo -e "${BLUE}1)${NC} اختبر النظام محلياً (test)"
    echo -e "${BLUE}2)${NC} شغّل الخادم (dev)"
    echo -e "${BLUE}3)${NC} بناء الإنتاج (build)"
    echo -e "${BLUE}4)${NC} دفع إلى GitHub (push)"
    echo -e "${BLUE}5)${NC} عرض الحالة (status)"
    echo -e "${BLUE}6)${NC} عرض السجل (log)"
    echo ""
    echo -e "${YELLOW}0)${NC} خروج"
    echo ""
}

# Menu loop
while true; do
    show_menu
    read -p "اختيارك: " choice
    
    case $choice in
        1)
            echo ""
            echo -e "${GREEN}🧪 تشغيل الاختبارات...${NC}"
            echo ""
            bash test-customer-service.sh
            ;;
        2)
            echo ""
            echo -e "${GREEN}🚀 تشغيل الخادم المحلي...${NC}"
            echo ""
            npm run dev
            ;;
        3)
            echo ""
            echo -e "${GREEN}🏗️ بناء المشروع...${NC}"
            echo ""
            npm run build
            
            if [ $? -eq 0 ]; then
                echo ""
                echo -e "${GREEN}✅ تم البناء بنجاح!${NC}"
            fi
            ;;
        4)
            echo ""
            echo -e "${GREEN}📤 دفع التغييرات...${NC}"
            echo ""
            read -p "رسالة الـ commit: " msg
            
            if [ -z "$msg" ]; then
                msg="feat: update customer service system"
            fi
            
            git add -A
            git commit -m "$msg"
            git push origin main
            
            echo ""
            echo -e "${GREEN}✅ تم الدفع بنجاح!${NC}"
            ;;
        5)
            echo ""
            echo -e "${GREEN}📋 حالة Git:${NC}"
            echo ""
            git status
            ;;
        6)
            echo ""
            echo -e "${GREEN}📊 آخر 5 تعديلات:${NC}"
            echo ""
            git log --oneline -5
            ;;
        0)
            echo ""
            echo -e "${GREEN}وداعاً! 👋${NC}"
            exit 0
            ;;
        *)
            echo -e "${YELLOW}⚠️ اختيار غير صحيح!${NC}"
            ;;
    esac
    
    echo ""
    read -p "اضغطي Enter للمتابعة..."
    clear
done
