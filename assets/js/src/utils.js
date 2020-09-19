function Utils(){
    this.convertTimestampForGoogleCalendar = function(timestamp){
        var a = new Date(timestamp*1000);
        var year = a.getFullYear();
        var month = this.leadZero(a.getMonth()+1,2);
        var date = this.leadZero(a.getDate(), 2);
        var time = year+'-'+month+'-'+date;

        return time;
    };
    
    this.convertTimestampForDatepicker = function(timestamp){
        var a = new Date(timestamp*1000);
        var year = a.getFullYear();
        var month = this.leadZero(a.getMonth()+1,2);
        var date = this.leadZero(a.getDate(), 2);
        var time = date+'/'+month+'/'+ year;

        return time;
    };
    
    this.convertTimestampToDateTime = function(timestamp){
        var a = new Date(timestamp*1000);
        var year = a.getFullYear();
        var month = this.leadZero(a.getMonth()+1,2);
        var date = this.leadZero(a.getDate(), 2);
        var time = this.leadZero(a.getHours(), 2)+":"+this.leadZero(a.getMinutes(), 2);
        var response = date+'/'+month+'/'+ year+" "+time;

        return response;
    };
    
    this.getNowInTime = function(){ // отдает текущее время в формате hh:mm
        var now = new Date();
        var hh = "";
        var mm = "";

        if (String(now.getHours()).length === 1)
            hh = "0"+now.getHours();
        else hh = now.getHours();

        if (String(now.getMinutes()).length === 1)
            mm = "0"+now.getMinutes();
        else mm = now.getMinutes();

        return hh+":"+mm;
    };
    
    this.getTimeFromTimestamp = function(timestamp){ // отдает время в формате h:m из таймштампа
        var now = new Date(timestamp*1000);
        return this.leadZero(now.getHours(), 2)+":"+this.leadZero(now.getMinutes(), 2);
    };
    
    this.leadZero = function(number, length) { // используется ф-иями формирования времени для заполнения нулями результат
        while(number.toString().length < length)
            number = '0' + number;
        
        return number;
    };
    
    this.errorModal = function(error_msg){ // бутстрап модал с ошибкой
        $('#error_modal .modal-body').html(error_msg);
        $('#error_modal').modal('show');
    };
    
    this.accessErrorModal = function(error_msg){ // бустрап модал с ошибкой доступа
        $('#access_error_modal .modal-body').text(error_msg);
        $('#access_error_modal').modal('show');
    };
    
    this.warningModal = function(warning_msg){ // бутстрап модал с предупреждением
        $('#warning_modal .modal-body').html(warning_msg);
        $('#warning_modal').modal('show');
    };
    
    this.successModal = function(success_msg){ // бутстрап модал с успехом
        $('#success_modal .modal-body').html(success_msg);
        $('#success_modal').modal('show');
    };
    
    this.isEmpty = function(field_id){ // проверка и подсветка элемента с id field_od на пустоту
        var element = $('#'+field_id);
        
        if (element.val().trim().length === 0){
           this.highlightField(element);
           return 1;
        }
        else return 0;
    };
    
    this.highlightField = function(field){ // подветка поля красным миганием
        field.css({background:"#c6123d"});
        field.animate({backgroundColor: "rgba(0,0,0,0)"}, 1000);
    };
    
    this.lightField = function(field){ // подсветка поля желтым миганием
        field.css({backgroundColor:"rgba(198, 18, 61, 0.16)"});
        field.animate({backgroundColor: "rgba(255, 255, 255, 1)"}, 1000);
    };
    
    this.numberWithCommas = function(x) { // разделение числа x запятыми через каждые 3 разряда
        return x != null ? x.toString().trim().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
    };
    
    this.numberWithCommasNoTrim = function(x) { // разделение числа x запятыми через каждые 3 разряда
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    this.numberRemoveCommas = function(x){ // удаление запятых и любых символов кроме цифр из номера
        return x.toString().trim().replace(/\D/g,'');
    };
    
    this.numberRemoveCommasOnly = function(x){ // удаление запятых и любых символов кроме цифр из номера
        return x.toString().replace(/,/g,'');
    };
    
    this.floatReplaceComma = function(x){ // замена в строке заптяой на точку
        return x.trim().replace(/,/g, '.');
    };
    
    this.filterNumbers = function(input){ // очистить строку от любых символов НЕцифр
        var value = $(input).val().trim();
        $(input).val(value.toString().replace(/(?!\-)\D/g,''));
    };
    
    this.forbidNumbers = function(input){ // очистить строку от любых символов
        var value = $(input).val().trim();
        $(input).val(value.toString().replace(/\d/g,''));
    };
    
    this.hlEmpty = function(object){ // подсветить пустые обязательные для ввода поля на форме
        for (var i = 0; i < object.neccesary.length; i++)
            if ($('#'+object.neccesary[i]).val().trim().length === 0)
                $('#'+object.neccesary[i]).css({background: "#f2dede"});
            else $('#'+object.neccesary[i]).css("background","");
    };
    
    this.hlSingleField = function(field){ // подсветить одиночное поле в форме
        field.css({background: "#f2dede"});
    };
    
    this.unHlSingleField = function(field){ // снять подсветку одиночного поле в форме
        field.css("background","");
    };
    
    this.getNow = function(){ // получить текущий таймштамп
        var now = new Date();
        return Math.floor(now.getTime()/1000);
    };
    
    this.lockContactRemark = function(contact_number){
        if ($('#contact'+contact_number+'_input').val().trim().length === 0)
            $('#contact'+contact_number+'_remark_input').attr("disabled", true);
    };
    
    this.unlockContactRemark = function(contact_number){
        if ($('#contact'+contact_number+'_input').val().trim().length > 0)
            $('#contact'+contact_number+'_remark_input').attr("disabled", false);
    };
    
    this.lockContactRemarkQ = function(contact_number){
        if ($('#contact'+contact_number+'_input').val().trim().length === 0)
            $('#contact'+contact_number+'_remark_input').attr("disabled", true);
    };
    
    this.unlockContactRemarkQ = function(contact_number){
        if ($('#contact'+contact_number+'_input').val().trim().length > 0)
            $('#contact'+contact_number+'_remark_input').attr("disabled", false);
    };
    
    /*this.isPhoneNumber = function(string) {
        return /^1?([2-9]\d\d){2}\d{4}$/.test(string.replace(/\D/g, ""));
    };*/
    
    this.getDayTime = function(timestamp){
        //var now = new Date(timestamp*1000);
        var hh = Math.floor(timestamp/3600);
        var mm = Math.floor(timestamp%3600/60);

        if (String(hh).length === 1)
            hh = "0"+hh;

        if (String(mm).length === 1)
            mm = "0"+mm;

        return hh+":"+mm;
    };
    
    this.getNavigator = function(name){ //  ff || chrome || safari || opera || ie || edge
        var isIE = false;
        var isChrome = false;
        var isOpera = false;
        
        switch (name){
            case "opera":
                isOpera = true;
                return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
            break;
            case "ff":
                return typeof InstallTrigger !== 'undefined';
            break;
            case "safari":
                return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
            break;
            case "ie":
                isIE = true;
                return /*@cc_on!@*/false || !!document.documentMode;
            break;
            case "edge":
                return !isIE && !!window.StyleMedia;
            break;
            case "chrome":
                isChrome = true;
                return !!window.chrome && !!window.chrome.webstore;
            break;
            default:
                return (isChrome || isOpera) && !!window.CSS;
            break;
        }
    };
    
    this.checkFieldsBothFilled = function(field1, field2, msg1, msg2){ // проверка, заполнены ли оба поля диапазона
        if (field1.val().trim().length > 0 && field2.val().trim().length === 0){
            this.hlSingleField(field2);
            throw msg1;
        }
        else if (field1.val().trim().length === 0 && field2.val().trim().length > 0){
            this.hlSingleField(field1);
            throw msg2;
        }
    };
    
    this.checkFieldsFinishNoLessEqualStart = function(field1, field2, msg){ // проверка, что конец диапазона больше или равно чем начало
        if (field1.val().trim().length > 0 && field2.val().trim().length > 0){
            if (Number(field1.val().trim()) >= Number(field2.val().trim())){
                utils.hlSingleField(field1);
                utils.hlSingleField(field2);
                throw msg;
            }
            else{
                utils.unHlSingleField(field1);
                utils.unHlSingleField(field2);
            }
        }
    };
    
    this.checkFieldsFinishNoLessStart = function(field1, field2, msg){ // проверка, что конец диапазона больше  чем начало
        if (field1.val().trim().length > 0 && field2.val().trim().length > 0){
            if (Number(field1.val().trim()) > Number(field2.val().trim())){
                utils.hlSingleField(field1);
                utils.hlSingleField(field2);
                throw msg;
            }
            else{
                utils.unHlSingleField(field1);
                utils.unHlSingleField(field2);
            }
        }
    };
    
    this.getCookie = function(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    this.setCookie = function(name, value, options) { // e.g. ("payment_id", response, {expires: 315360000});
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    };
    
    this.htmlSpinner = function(element_id){
        $('#'+element_id)
            .attr({
                "text_buffer": $('#'+element_id).html(),
                "disabled": true
            })
            .html('<i class="fa fa-spinner fa-spin"></i>');
    };
    
    this.removeHtmlSpinner = function(element_id){
        $('#'+element_id)
            .attr({"disabled": false})
            .html($('#'+element_id).attr("text_buffer"));
    };
    
    this.getJSONValueKey = function(object, key, value){ // находит ключ в джсоне по значению
        for (var i = 0; i < object.length; i++){
            if (object[i][key] == value){
                return  i;
            }
        }
        
        return -1;
    };
    
    this.onOwlToggle = function(){
        if (!owl.locked && $('.sidebar-mini').length == 1 && $('.main-content-wrapper').offset().left < 350){
            $('.owl_side_button').addClass("owl_close_side_button").removeClass("owl_side_button");
            $('.main-content-wrapper').attr("style", "margin-left: 350px !important;");
        }
        else if (!owl.locked){
            $('.owl_close_side_button').removeClass("owl_close_side_button").addClass("owl_side_button")
            $('.main-content-wrapper').css("margin-left", screen.width > 1024 ? "auto" : "51px");
        }
    };
    
    this.sortString = function(array, extractor) { //  ф-ия для сортировки длинных предложений из строк
        "use strict";
        // преобразуем исходный массив в массив сплиттеров
        var splitters = array.map(makeSplitter);
        // сортируем сплиттеры
        var sorted = splitters.sort(compareSplitters);
        // возвращаем исходные данные в новом порядке
        return sorted.map(function (splitter) {
          return splitter.item;
        });
        // обёртка конструктора сплиттера
        function makeSplitter(item) {
          return new Splitter(item);
        }
        // конструктор сплиттера
        //    сплиттер разделяет строку на фрагменты "ленивым" способом
        function Splitter(item) {
          var index = 0;           // индекс для прохода по строке  
          var from = 0;           // начальный индекс для фрагмента
          var parts = [];         // массив фрагментов
          var completed = false;       // разобрана ли строка полностью
          // исходный объект
          this.item = item;
          // ключ - строка
          var key = (typeof (extractor) === 'function') ?
            extractor(item) :
            item;
          this.key = key;
          // количество найденных фрагментов
          this.count = function () {
            return parts.length;
          };
          // фрагмент по индексу (по возможности из parts[])
          this.part = function (i) {
            while (parts.length <= i && !completed) {
              next();   // разбираем строку дальше
            }
            return (i < parts.length) ? parts[i] : null;
          };
          // разбор строки до следующего фрагмента
          function next() {
            // строка ещё не закончилась
            if (index < key.length) {
              // перебираем символы до границы между нецифровыми символами и цифрами
              while (++index) {
                var currentIsDigit = isDigit(key.charAt(index - 1));
                var nextChar = key.charAt(index);
                var currentIsLast = (index === key.length);
                // граница - если символ последний,
                // или если текущий и следующий символы разнотипные (цифра / не цифра)
                var isBorder = currentIsLast ||
                  xor(currentIsDigit, isDigit(nextChar));
                if (isBorder) {
                  // формируем фрагмент и добавляем его в parts[]
                  var partStr = key.slice(from, index);
                  parts.push(new Part(partStr, currentIsDigit));
                  from = index;
                  break;
                } // end if
              } // end while
              // строка уже закончилась
            } else {
              completed = true;
            } // end if
          } // end next
          // конструктор фрагмента
          function Part(text, isNumber) {
            this.isNumber = isNumber;
            this.value = isNumber ? Number(text) : text;
          }
        }
        // сравнение сплиттеров
        function compareSplitters(sp1, sp2) {
          var i = 0;
          do {
            var first = sp1.part(i);
            var second = sp2.part(i);
            // если обе части существуют ...
            if (null !== first && null !== second) {
              // части разных типов (цифры либо нецифровые символы)  
              if (xor(first.isNumber, second.isNumber)) {
                // цифры всегда "меньше"      
                return first.isNumber ? -1 : 1;
                // части одного типа можно просто сравнить
              } else {
                var comp = compare(first.value, second.value);
                if (comp != 0) {
                  return comp;
                }
              } // end if
              // ... если же одна из строк закончилась - то она "меньше"
            } else {
              return compare(sp1.count(), sp2.count());
            }
          } while (++i);
          // обычное сравнение строк или чисел
          function compare(a, b) {
                if (response_list.sorted === 0){
                    return (a < b) ? -1 : (a > b) ? 1 : 0;
                }
                else{
                    return (a > b) ? -1 : (a < b) ? 1 : 0;
                }
          };
        };
        // логическое исключающее "или"
        function xor(a, b) {
          return a ? !b : b;
        };
        // проверка: является ли символ цифрой
        function isDigit(chr) {
          var code = charCode(chr);
          return (code >= charCode('0')) && (code <= charCode('9'));
          function charCode(ch) {
            return ch.charCodeAt(0);
          };
        };
    };
    
    this.isJSON = function(argument){
        return Object.prototype.toString.call(argument) === "[object Object]" ? true : false;
    };
    
    this.isArray = function(argument){
        return Object.prototype.toString.call(argument) === "[object Array]" ? true : false;
    };
    
    this.addGooglePlaceShort = function(placeid){ // добавляет место в базу google_autocomplete
        $.post("/api/googleac/ajaxaddshort.json",{
            placeid: placeid
        }, null);
    };
    
    this.addGooglePlace = function(placeid, old_placeid, short_name, long_name){ // добавляет место в базу google_autocomplete
        $.post("/api/googleac/ajaxadd.json",{
            short_name: short_name,
            long_name: long_name,
            placeid: placeid,
            old_placeid: old_placeid
        }, null);
    };
    
    this.addGooglePlaceLatLng = function(location, placeid, old_placeid){ // добавляет координаты места в базу google_autocomplete
        $.post("/api/googleac/ajaxaddlatlng.json",{
            lat: location.lat(),
            lng: location.lng(),
            placeid: placeid,
            old_placeid: old_placeid
        }, null);
    };
    
    this.addGooglePlaceBackend = function(placeids){ // добавляет место в базу google_autocomplete
        $.post("/api/googleac/ajaxaddbackend.json",{
            placeids: JSON.stringify(placeids)
        }, null);
    };
    
    this.addGooglePlaceLatLngBackend = function(placeids){ // добавляет координаты места в базу google_autocomplete
        $.post("/api/googleac/ajaxaddlatlngbackend.json",{
            placeids: JSON.stringify(placeids)
        }, null);
    };
    
    this.stringContains = function(string, substring){
        if (string.indexOf(substring) === -1){
            return false;
        }
        else{
            return true;
        }
    };
    
    this.arrUnique = function(array, key) {
        if (array.length === 0){
            return array;
        }

        var new_array = [array.pop()];
        var exist = 0;

        while (array.length > 0){
            exist = 0;
            var element = array.pop();

            for (var i = 0; i < new_array.length; i++){
                if (
                        element != null && 
                        new_array[i] != null && 
                        element[key] != null && 
                        element[key] == new_array[i][key]
                ){
                    exist++;
                }
            }

            if (exist == 0){
                new_array.push(element);
            }
        }

        return new_array;
    };
    
    this.setPasswordShowButton = function(password_input, show_button){
        show_button.click({input: password_input}, function(e){
            if (e.data.input.attr("type") === "password"){
                e.data.input.attr("type", "text");
            }
            else{
                e.data.input.attr("type", "password");
            }
        });
    };
    
    this.getNavigatorLang = function(){
        var lang = navigator.language || navigator.userLanguage;
        
        switch (lang){
            case "en-US":
                return "en";
            break;
            case "he":
                return "he";
            break;
            case "ru":
                return "ru";
            break;
            default:
                return "en";
            break;
        }
    };
    
    this.setSelectOverflow = function(select){
        $(select).attr("title", $(select).children("option:selected").text());
    };
    
    this.setSelectsOverflows = function(list){
        for (var i = 0; i < list.length; i++){
            $('#'+list[i]).attr("title", $('#'+list[i]).children("option:selected").text());
        }
    };
    
    this.getDateOnlyFromTimestamp = function(timestamp){
        if (timestamp == "" || timestamp == 0 || timestamp == null){
            return "";
        }
        else{
            var date = new Date(timestamp*1000);
            var day = date.getDate();
            var month = date.getMonth()+1;
            var year = date.getFullYear();

            return this.leadZero(day, 2)+"/"+this.leadZero(month, 2)+"/"+year;
        }
    };
    
    this.getDateOnlyFromTimestampForMoment = function(timestamp){
        if (timestamp == "" || timestamp == 0 || timestamp == null){
            return "";
        }
        else{
            var date = new Date(timestamp*1000);
            var day = date.getDate();
            var month = date.getMonth()+1;
            var year = date.getFullYear();

            return this.leadZero(month, 2)+"-"+this.leadZero(day, 2)+"-"+year;
        }
    };
    
    this.validateEmail = function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };
    
    this.onEnter = function(e, input){
        if (e.keyCode == 13){
            eval($(input).data("onenter-func"));
            
            return false;
        }
    };
    
    this.openInNewTab = function(url){
        var win = window.open(url, '_blank');
        win.focus();
    };
    
    this.getFloatPart = function(float_number){
        return String(float_number).split(".")[1];
    };
    
    this.isEmpty = function(variable){
        var response = false;

        if (variable === undefined || variable === null){
            response = true;
        }

        var in_string = String(variable);

        if (in_string == "null" || in_string == "undefined" || in_string.length === 0){
            response = true;
        }

        return response;
    };
}