<?php
/**
 * Plugin Name:       AbcSubmit
 * Description:       Easy drag and drop form builder, connect with integrations, collect data and files, accept payments online, create calendar for your websites.
 * Version:           1.2.4
 * Author:            AbcSubmit
 * Author URI:        https://www.abcsubmit.com
 * License:           GPL-2.0+
 * Text Domain:       abcsubmit
 */

defined( 'ABSPATH' ) or die("You can not access this file!");

if ( ! function_exists( 'add_action' ) ) {
    die("You can not access this file!");
}

/*
 * Main class
 */
/**
 * Class AbcSubmit
 *
 * This class creates the option page and add the web app script
 */
class AbcSubmit
{
    const ABCSUBMIT_WP_DOMAIN = 'https://wordpress.abcsubmit.com';
    const ABCSUBMIT_VERSION = '1.2.4';
    /**
     * Plugin version
     *
     * @var string
     */
    private $pluginVersion;

    /**
     * AbcSubmit constructor.
     *
     * The main plugin actions registered for WordPress
     */



    public function __construct()
    {

        $this->pluginName = 'abcsubmit';
        $this->pluginVersion = self::ABCSUBMIT_VERSION;

        if (
            (
                in_array($this->pluginName . '/' . $this->pluginName . '.php', get_option('active_plugins'))
                || (
                    function_exists('is_plugin_active_for_network')
                    && is_plugin_active_for_network($this->pluginName . '/' . $this->pluginName . '.php')
                )
            )
            && strstr($_SERVER['REQUEST_URI'], 'wp-admin/post-new.php') || strstr($_SERVER['REQUEST_URI'], 'wp-admin/post.php')
        ) {

            add_action('media_buttons', array($this, 'addMediaButtonInWPEditor'));
            add_filter('wp_enqueue_media', array($this, 'addMediaScriptsInWPEditor'));
        }



        if (in_array($this->pluginName . '/' . $this->pluginName . '.php', get_option('active_plugins'))
            || (
                function_exists('is_plugin_active_for_network')
                && is_plugin_active_for_network($this->pluginName . '/' . $this->pluginName . '.php')
            )
        ){
            wp_enqueue_script('thickbox', null, array('jquery'));
            wp_enqueue_style('thickbox');
        }

        add_shortcode( 'abc-submit-inline', array($this,'replaceShortCodeWithEmbedCodeJs'));
        add_shortcode( 'abc-submit-popup', array($this,'replaceShortCodeWithButton'));

        wp_enqueue_script('abcsubmit-admin-js', plugin_dir_url( __FILE__ ) . '/assets/js/admin.js', array(), $this->pluginVersion);
        wp_enqueue_style('admin_abcsubmit_css', plugin_dir_url( __FILE__ ) . '/assets/css/admin.css', array(), $this->pluginVersion);

        add_filter( 'widget_text', 'do_shortcode' );
        add_filter( 'the_content', 'do_shortcode' );
        add_filter('comment_text', 'do_shortcode');
        add_filter('get_comment_text', 'do_shortcode');
        add_filter('the_excerpt', 'do_shortcode');

        add_action('admin_menu', array($this,'addAdminMenu'));

        add_action( 'plugins_loaded', array($this, 'onPluginLoadedAction'));

    }

    function onPluginLoadedAction()
    {
        if (function_exists('register_block_type')) {
            //  Hook server side rendering into render callback
            register_block_type(
                'abc-gutenberg/abcsubmit', array(
                    'render_callback' => array($this,'blockTypeCallbackFunction'),
                    'attributes' => array(
                        'documentId' => array(
                            'type' => 'string',
                        )
                    ),
                )
            );
        }
    }

    function replaceShortCodeWithButton( $atts ) {

        $resultAtts = shortcode_atts( array(
            'id' => '0',
            'name' => 'Click to Open'
        ), $atts );

        $documentId = esc_attr($resultAtts['id']);
        $documentName = esc_attr($resultAtts['name']);

        return
            '<a 
                    style="padding: 4px 10px 4px 10px;background-color: #25a725;color: white;border-radius: 4px;"
                    class="thickbox abcsubmit-document-button abcsubmit-document-'. $documentId . '" 
                    href="//wordpress.abcsubmit.com/view/' . $documentId . '?KeepThis=true&TB_iframe=true&height=400&width=600">' .
            $documentName .
            '</a>';
    }

    function replaceShortCodeWithEmbedCodeJs($atts) {

        $resultAtts = shortcode_atts( array(
            'id' => '0'
        ), $atts );

        $id = esc_attr($resultAtts['id']);

        return '<script type="text/javascript" src="//wordpress.abcsubmit.com/embed/' .
            $id .
            '/embed-form.js" data-role="abcsubmit-form-embed" data-document-id="' .
            $id .
            '" ></script>';
    }

    function blockTypeCallbackFunction( $atts ) {
        $resultAtts = shortcode_atts( array(
            'documentId' => '0'
        ), $atts );

        $id = esc_attr($resultAtts['documentId']);

        return "[abc-submit-inline id='{$id}']";

    }

    function addMediaButtonInWPEditor() {
        ?>
        <a id="abcsubmit-media-button" class="button" onclick="showWPThickboxWithOurDocuments()">
            <img class="abcsubmit-media-logo-image" src="<?=plugin_dir_url(plugin_dir_path(__FILE__))?><?php echo $this->pluginName ?>/assets/img/iconAbcSubmit.png"> AbcSubmit
        </a>

        <div id="abcsubmit-media-thickbox" style="display:none"></div>
        <?php
    }

    /**
     * Create menu and submenu
     */
    public function addAdminMenu()
    {
        if ( ! current_user_can('manage_options' ) ) {
            return;
        }

        add_menu_page(
            $this->pluginName,
            'AbcSubmit',
            'manage_options',
            $this->pluginName,
            array($this, 'addAbcSubmitEditor'),
            self::ABCSUBMIT_WP_DOMAIN . '/site/wp-content/plugins/abcsubmit/assets/img/icon-abcsubmit-dashboard.png',
            2
        );

        add_submenu_page(
            $this->pluginName,
            'AbcSubmit',
            'New Form',
            'manage_options',
            'abcSubmitNewForm',
            array($this, 'addAbcSubmit')
        );

        add_submenu_page(
            $this->pluginName,
            'AbcSubmit',
            'My Forms',
            'manage_options',
            'abcSubmitMyForms',
            array($this, 'addAbcSubmitSubMenuMyForms')
        );

        add_submenu_page(
            $this->pluginName,
            'AbcSubmit',
            'My Account',
            'manage_options',
            'abcSubmitMyAccount',
            array($this, 'addAbcSubmitSubMenuMyAccount')
        );

        add_submenu_page(
            $this->pluginName,
            'AbcSubmit',
            'Help',
            'manage_options',
            'abcSubmitHelp',
            array($this, 'addAbcSubmitSubMenuHelp')
        );

//        add_submenu_page(
//            $this->pluginName,
//            'AbcSubmit',
//            'Pricing',
//            'manage_options',
//            'abcSubmitPricing',
//            array($this, 'addAbcSubmitSubMenuPricing')
//        );

    }

    public function addAbcSubmit()
    {
        $this->loadEditorIframe(self::ABCSUBMIT_WP_DOMAIN.'/edit/?cmd=load_section&section=new');
    }

    public function addAbcSubmitEditor()
    {
        $this->loadEditorIframe(self::ABCSUBMIT_WP_DOMAIN.'/edit/');
    }

    public function addAbcSubmitSubMenuPricing()
    {
        $this->loadEditorIframe(self::ABCSUBMIT_WP_DOMAIN.'/plans-and-pricing?scrollbars=0');
    }

    public function addAbcSubmitSubMenuMyForms()
    {
        $this->loadEditorIframe(self::ABCSUBMIT_WP_DOMAIN.'/edit/?cmd=load_section&section=open');
    }

    public function addAbcSubmitSubMenuMyAccount()
    {
        $this->loadEditorIframe(self::ABCSUBMIT_WP_DOMAIN.'/edit/?cmd=load_section&section=account');
    }

    public function addAbcSubmitSubMenuHelp()
    {
        $this->loadEditorIframe(self::ABCSUBMIT_WP_DOMAIN.'/edit/?cmd=load_section&section=help');
    }

    public function loadEditorIframe($url) {
        echo '<div>
                <p>Create stunning forms for your website</p>
                <button class="button button-primary" onclick="showAbcSubmitEditor();">Open AbcSubmit Form Builder</button>
              </div>';

        echo ' <div class="abcsubmit-full-screen" style="display:block;">
                <div class="abcsubmit-header-in-full-screen">
                <div class="abcsubmit-header-in-full-screen-name" >AbcSubmit Form Builder</div>
                <div class="abcsubmit-header-in-full-screen-close" onclick="closeAbcSubmitEditor()">Close editor</div>
                </div>
                <p class="load-builder">Loading AbcSubmit form builder ...</p>

                <iframe onload="hideLoader()"
                    class="abcsubmit-content-preview"
                    src="'.$url.'" 
                    frameborder="0"
                >
                </div>';
    }

    public function setJavascriptForScrollToTopWhenEditorIsLoaded() {
        echo '<style>div.update-nag {display:none;}</style>';
    }

    function addMediaScriptsInWPEditor()
    {
        wp_enqueue_style('media_button_css', plugin_dir_url( __FILE__ ) . 'assets/css/widget.css', array(), $this->pluginVersion);
        wp_enqueue_script('media_button_js', plugin_dir_url( __FILE__ ) . 'assets/js/widget.js', array(), $this->pluginVersion);
        wp_enqueue_script('abcsubmit-wp-cookie-runtimes-js', plugin_dir_url( __FILE__ ) . 'assets/js/wp_cookie_runtime.js', array(), $this->pluginVersion);


        $blockPath = '/gutenberg/dist/block.js';
        $stylePath = '/gutenberg/dist/block.css';

        // Enqueue the bundled block JS file
        wp_enqueue_script(
            'abcsubmit-gutenberg-block-js',
            plugins_url( $blockPath, __FILE__ ),
            [ 'wp-i18n', 'wp-blocks', 'wp-edit-post', 'wp-element', 'wp-editor', 'wp-components', 'wp-data', 'wp-plugins', 'wp-edit-post', 'wp-api' ],
            filemtime( plugin_dir_path(__FILE__) . $blockPath )
        );

        // Enqueue frontend and editor block styles
        wp_enqueue_style(
            'abcsubmit-gutenberg-block-css',
            plugins_url( $stylePath, __FILE__ ),
            '',
            filemtime( plugin_dir_path(__FILE__) . $stylePath )
        );
    }

}

if ( class_exists('AbcSubmit') ) {
    $abcsubmitDocuments = new AbcSubmit();
}


