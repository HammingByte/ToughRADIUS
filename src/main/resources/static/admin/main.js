if (!window.toughradius)
    toughradius={};

currentLang = navigator.language;
if(!currentLang){
    currentLang = navigator.browserLanguage;
}
webix.i18n.setLocale(currentLang);

toughradius.admin = {};
toughradius.admin.pageId = "toughradius.admin-main-page";
toughradius.admin.panelId = "toughradius.admin-main-panel";
toughradius.admin.toolbarId = "toughsms.admin-main-toolbar";
toughradius.admin.actions = {};
toughradius.admin.methods = {};

toughradius.admin.methods.doLogin = function (formValues){
    webix.ajax().post('/login',formValues).then(function (result) {
        var resp = result.json();
        if (resp.code===0){
            window.location.href = "/admin";
        }else{
            webix.message({type: resp.msgtype, text:resp.msg,expire:500});
        }
    }).fail(function (xhr) {
        webix.message({type: 'error', text: "登录失败:"+xhr.statusText,expire:500});
    });
};

toughradius.admin.methods.showBusyBar = function (viewid,delay, callback){
    $$(viewid).disable();
    $$(viewid).showProgress({
        type:"top",
        delay:delay,
        hide:true
    });
    setTimeout(function(){
        callback();
        $$(viewid).enable();
    }, delay);
};


toughradius.admin.methods.setToolbar = function(icon, title, help){
    $$(toughradius.admin.toolbarId+"_icon").define("icon",icon);
    $$(toughradius.admin.toolbarId+"_icon").refresh();
    $$(toughradius.admin.toolbarId+"_title").define("label",title);
    $$(toughradius.admin.toolbarId+"_title").refresh();
};



webix.ready(function() {
    /**
     * 加载主界面
     */
    webix.ajax().get('/admin/session',{}).then(function (result) {
        var resp = result.json();
        if(resp.code===1){
            webix.message({type:"error",text:resp.msg});
            setTimeout(function(){window.location.href = "/admin";},2000);
            return false;
        }
        var session = resp.data;
        webix.require("sidebar.js", function () {
            webix.require("css/sidebar.css");

            webix.ui({
                rows: [
                    {
                        view: "toolbar",
                        padding: 3,
                        height: 44,
                        css: "page-nav",
                        elements: [
                            {
                                cols: [
                                    { view: "template", css: "nav-logo", maxWidth:188, template: "<a href='/admin'><img src='/static/images/logo.png' width='156' height='25'/></a>", height:30},
                                    {
                                        view: "button", type: "icon", icon: "bars", width: 37, align: "left", css: "nav-item-color", click: function () {
                                            $$("$sidebar1").toggle()
                                        }
                                    },
                                    {},
                                    {
                                        view: "button", css: "nav-item-color", type: "icon", width: 120, icon: "sign-out",align:"right",
                                        label: "退出", click: function () {
                                            window.location.href = "/admin/logout";
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {height:2},
                    {
                        borderless:true,
                        cols: [
                            {
                                rows:[
                                    // { view: "button", css: "sideber-label", type: "image", image: "/static/images/logo.png", labelWidth:160},
                                    // { view: "template", css: "nav-logo", template: "<a href='/admin'><img src='"+session.uidata.LOGO_URL+"' width='156' height='25'/></a>", height:40},
                                    {
                                        rows: [
                                            {
                                                view:"search", height:40, css:"sideber-box", align:"center", placeholder:"快速查找用户", id:"search"
                                            },
                                            // { view: "label", css: "sideber-label", label: "<img src='/static/images/logo.png' width='160' height='32' style='margin-top: 7px;'/>", width: 165 },
                                            { view: "label", css: "sideber-label", label: " 功能导航" },
                                            {
                                                view: "sidebar",
                                                scroll:"auto",
                                                width: 220,
                                                data: session.menus,
                                                on: {
                                                    onAfterSelect: function (id) {
                                                        try {
                                                            console.log("action = " + id);
                                                             webix.require("admin/" + id + ".js?rand="+new Date().getTime(), function () {
                                                                toughradius.admin[id].loadPage(session);
                                                             });
                                                        } catch (err) {
                                                            console.log(err);
                                                        }
                                                    }
                                                },
                                                ready: function () {
                                                    webix.require("admin/dashboard.js?rand="+new Date().getTime(), function () {
                                                        toughradius.admin.dashboard.loadPage(session);
                                                    });
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                rows:[
                                    {
                                        height:40,
                                        css:"main-toolbar",
                                        cols:[
                                            { id:toughradius.admin.toolbarId+"_icon",view:"icon", icon:"home", width:45},
                                            { id:toughradius.admin.toolbarId+"_title", view: "label", label: ""},
                                            { },
                                            {
                                                view: "button", type: "icon", width: 100, icon: "book", label: "在线文档",  click: function () {
                                                    window.open("http://www.toughradius.net","在线文档","resizable,scrollbars,status");
                                                }
                                            }
                                        ]
                                    },
                                    {height:5},
                                    {
                                        id: toughradius.admin.pageId,
                                        css:"main-page",
                                        paddingX:15,
                                        // paddingY:3,
                                        rows:[
                                            {height:9},
                                            {
                                                id: toughradius.admin.panelId,
                                                template: ""
                                            },
                                            {height:9},
                                            {
                                                css:"page-footer",
                                                height:36,
                                                borderless:true,
                                                cols:[
                                                    {},{view:"label", css:"Copyright", label:"© 2018 The ToughRADIUS Project and Contributors"}, {}
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

        });
    });

});
