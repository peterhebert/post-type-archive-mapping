<?php
/**
 * Enqueue assets for the blocks.
 *
 * @package PTAM
 */

namespace PTAM\Includes;

use PTAM\Includes\Functions as Functions;

/**
 * Class enqueue
 */
class Enqueue {

	/**
	 * Main init functioin.
	 */
	public function run() {
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
	}

	/**
	 * Enqueue block assets.
	 */
	public function enqueue_block_assets() {
		// Load the compiled styles.
		wp_enqueue_style(
			'ptam-style-css',
			\PostTypeArchiveMapping::get_plugin_url( 'dist/blocks.style.build.css' ),
			PTAM_VERSION,
			'all'
		);
		wp_enqueue_style(
			'ptam-style-css-editor',
			\PostTypeArchiveMapping::get_plugin_url( 'dist/blocks.editor.build.css' ),
			PTAM_VERSION,
			'all'
		);
	}

	/**
	 * Register block editor assets.
	 */
	public function enqueue_block_editor_assets() {
		wp_register_style(
			'ptam-style-editor-css',
			\PostTypeArchiveMapping::get_plugin_url( 'dist/blocks.editor.build.css' ),
			PTAM_VERSION,
			'all'
		);
		wp_register_script(
			'ptam-custom-posts-gutenberg',
			\PostTypeArchiveMapping::get_plugin_url( 'dist/blocks.build.js' ),
			array( 'wp-blocks', 'wp-element' ),
			PTAM_VERSION,
			true
		);

		// Get Taxonomies in key/value pair.
		$taxonomies = get_taxonomies(
			array(
				'public'             => true,
				'publicly_queryable' => true,
			),
			'objects'
		);
		$tax_array  = array();
		foreach ( $taxonomies as $index => $taxonomy ) {
			$tax_array[ $index ] = $taxonomy->label;
		}

		$post_type_array = array();
		$post_types      = get_post_types(
			array(
				'public' => true,
			),
			'objects'
		);
		foreach ( $post_types as $post_type => $type ) {
			if ( get_object_taxonomies( $post_type, 'names' ) ) {
				$post_type_array[ $post_type ] = $type->label;
			}
		}

		$wpml_languages = array();
		if ( function_exists( 'icl_get_languages' ) ) {
			$languages = icl_get_languages();
			foreach ( $languages as $language ) {
				$wpml_languages[] = array(
					'value' => $language['code'],
					'label' => $language['native_name'],
				);
			}
		}

		// Pass in i18n variables.
		wp_localize_script(
			'ptam-custom-posts-gutenberg',
			'ptam_globals',
			array(
				'img_url'                      => esc_url( \PostTypeArchiveMapping::get_plugin_url( 'img/loading.png' ) ),
				'rest_url'                     => esc_url( rest_url() ),
				'taxonomies'                   => $tax_array,
				'fonts'                        => Functions::get_fonts(),
				'image_sizes'                  => Functions::get_all_image_sizes(),
				'post_types'                   => $post_type_array,
				'custom_posts_block_preview'   => esc_url( \PostTypeArchiveMapping::get_plugin_url( 'img/custom-post-types-block.jpg' ) ),
				'term_grid_block_preview'      => esc_url( \PostTypeArchiveMapping::get_plugin_url( 'img/term-grid-block.jpg' ) ),
				'featured_posts_block_preview' => esc_url( \PostTypeArchiveMapping::get_plugin_url( 'img/featured-posts-block.jpg' ) ),
				'wpml_installed'               => defined( 'ICL_SITEPRESS_VERSION' ) ? true : false,
				'wpml_languages'               => $wpml_languages,
			)
		);
		wp_set_script_translations( 'ptam-custom-posts-gutenberg', 'post-type-archive-mapping' );
	}
}
