function hideLoader(){
    jQuery(".load-builder").hide();
}

function closeAbcSubmitEditor() {
    jQuery('.abcsubmit-full-screen').hide();
}

function showAbcSubmitEditor() {

    if (jQuery('.abcsubmit-full-screen').length) {
        jQuery('.abcsubmit-full-screen').show();
    } else {
        window.location.href = "/admin.php?page=abcsubmit";
    }
}