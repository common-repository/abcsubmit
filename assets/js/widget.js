function showWPThickboxWithOurDocuments() {
    jQuery('#TB_load').show();
    createDocumentListToPublish();
    jQuery('#TB_load').hide();
}

function insertShortCodeInEditor() {
    var documentIdToInsert = jQuery('.abcsubmit-select-document-to-insert').val();
    window.send_to_editor('[abc-submit-inline id="' + documentIdToInsert + '"]');
    tb_remove();
}

function insertShortCodeInEditorAsButton() {
    var documentIdToInsert = jQuery('.abcsubmit-select-document-to-insert').val();
    var documentName = jQuery(".abcsubmit-select-document-to-insert option:selected").text();
    window.send_to_editor('[abc-submit-popup id="' + documentIdToInsert + '" name="' + documentName + '"]');
    tb_remove();
}

function onMessageReceivedFromIframe(event) {

    if (event.data
        && event.data.command
        && event.data.command === 'resize'
        && event.data.height
        && event.data.width
        && event.data.documentId
    ) {
        var element = document.getElementById(event.data.documentId);

        if (element) {
            element.setAttribute('height', event.data.height);
            element.setAttribute('width', event.data.width);
        }
    }
}

window.addEventListener("message", onMessageReceivedFromIframe, true);

function createDocumentListToPublish(documentList) {

    (function ($) {

        $.Deferred(function (defer) {

            getJwt().then(function (jwt) {

                $('#abcsubmit-login-dialog, .abc-document-list-for-publish').remove();

                getDocuments(jwt).then(function(documentsList) {

                    defer.resolve( documentsList );

                }).fail(function(error){

                    try {

                        window.localStorage.setItem('jwt', "");

                    } catch (e) {

                        try {

                            window.sessionStorage.setItem('jwt', "");

                        } catch (e) {

                            wp_set_cookie( 'jwt', "" );

                        }

                    }

                    createDocumentListToPublish();

                });

            });


        }).then(function (documentList) {

            if ( ! documentList.length ) {
                jQuery('#abcsubmit-media-thickbox').html(
                    '<div class=\"abc-document-list-for-publish\">' +
                    'You dont have any forms yet. Navigate to your AbcSubmit plugin and show us some art.' +
                    '</div>');
            } else {

                var ListWithAllDocumentsHtml = '<div class="abc-document-list-for-publish">';
                var selectDocuments = '<select class="abcsubmit-column-document abcsubmit-select-document-to-insert">';

                documentList.forEach(function (value, index) {

                    selectDocuments += '<option value="' + value.id + '">' + value.name + '</option>';

                });

                selectDocuments += '</select>';

                ListWithAllDocumentsHtml += '<div class="abc-document-row">' +
                    selectDocuments +
                    '<button onclick="insertShortCodeInEditor();" class="abcsubmit-column-document abc_publish_document_js" >Embed inline</button>' +
                    '<button onclick="insertShortCodeInEditorAsButton();" class="abcsubmit-column-document abc_publish_document_lightbox">Embed as button</button>' +
                    '</div>';

                ListWithAllDocumentsHtml += '</div>';

                jQuery('#abcsubmit-media-thickbox').html(ListWithAllDocumentsHtml);
            }

            tb_show('Choose a form to publish it on your page', "#TB_inline?inlineId=abcsubmit-media-thickbox");
            $("#TB_ajaxContent, #TB_iframeContent").css({width: '100%'});
            $("#TB_ajaxContent, #TB_iframeContent").css({height: '100%'});
            jQuery('#TB_load').hide();


        });


    })(jQuery);


}

function getDocuments(jwt) {

    return (function($){

        return $.Deferred(function(defer){

            $.get("//www.abcsubmit.com/api/v1/forms/?JWT=" + jwt + "&t=" + ( +new Date ) )
                .then( function( documentsList) {

                    defer.resolve(documentsList);

                })
                .fail( function(xhr){

                    defer.reject( new Error("Failed to fetch documents list from server"));

                });

        });

    })(jQuery);

}

function getJwt() {

    return (function ($) {

        return $.Deferred(function (defer) {

            var existentJwtToken = null;

            try {

                existentJwtToken = window.localStorage.getItem('jwt');

            } catch (e) {

                try {

                    existentJwtToken = window.sessionStorage.getItem('jwt');

                } catch (e) {

                    existentJwtToken = wp_get_cookie( 'jwt');

                }

            }

            if (existentJwtToken) {

                defer.resolve(existentJwtToken);

            }

            // CREATE A POPUP AND MAKE USER TO LOGIN
            var dialog = document.createElement('div');

            dialog.innerHTML = [

                '<form onsubmit="return false;">',

                '<div class="abcsubmit-user-div">',
                '<label for="abcsubmit-user">Email</label>',
                '<input type=text name="abcsubmit-user" id="abcsubmit-user" placeholder="Your AbcSubmit email" />',
                '</div>',
                '',
                '<div class="abcsubmit-password-div">',
                '<label for="abcsubmit-password">Password</label>',
                '<input type=password name="abcsubmit-password" id="abcsubmit-password" placeholder="Your AbcSubmit password" />',
                '</div>',
                '',
                '<div class="abcsubmit-actions-div"><button class="button button-primary" id="abcsubmit-login-button">Login</button>',
                '<button id="abcsubmit-cancel-login-button" class="button button-secondary">Cancel</button></div>',

                '</form>',

            ].join("\n");

            dialog.id = "abcsubmit-login-dialog";

            document.getElementById('abcsubmit-media-thickbox').innerHTML = '';
            document.getElementById('abcsubmit-media-thickbox').appendChild(dialog);

            tb_show('AbcSubmit Log In ', "#TB_inline?inlineId=abcsubmit-media-thickbox");
            $("#TB_ajaxContent, #TB_iframeContent").css({width: '100%'});
            $("#TB_ajaxContent, #TB_iframeContent").css({height: '100%'});

            $(dialog).on('click', 'button#abcsubmit-login-button', function () {


                var username = $(dialog).find("#abcsubmit-user").val();
                var password = $(dialog).find("#abcsubmit-password").val();

                if ( !username ) {
                    alert("Please enter your AbcSubmit email");
                    $(dialog).find("#abcsubmit-user").focus();
                    return;
                }

                if ( !password ) {
                    alert("Please enter your AbcSubmit password");
                    $(dialog).find("#abcsubmit-password").focus();
                    return;
                }

                $.post("//www.abcsubmit.com/api/v1/users/login", {
                    username: username,
                    password: password,
                    expiration_days: 30,
                    appName: 'WORDPRESS WIDGET'
                }).then(function (jwt) {

                    try {

                        window.localStorage.setItem('jwt', jwt);

                    } catch (e) {

                        try {

                            window.sessionStorage.setItem('jwt', jwt);

                        } catch (e) {

                            wp_set_cookie( 'jwt', jwt);

                        }

                    }

                    defer.resolve( jwt );

                }).fail(function (xhr) {

                    if (!xhr) {
                        return;
                    }

                    var errorAsJSON = xhr.responseJSON;

                    if (!errorAsJSON) {
                        alert("Unknown login problem");
                        return;
                    }

                    if (errorAsJSON.message) {
                        alert(errorAsJSON.message);
                    } else {
                        alert("Unknown login problem");
                    }

                });

            });

            $(dialog).on('click', 'button#abcsubmit-cancel-login-button', function () {

                tb_remove();

                defer.reject(new Error("User aborted the login process"));

            });

        });

    })(jQuery);


}