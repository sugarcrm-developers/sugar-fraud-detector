/*
 * Your installation or use of this SugarCRM file is subject to the applicable
 * terms available at
 * http://support.sugarcrm.com/Resources/Master_Subscription_Agreements/.
 * If you do not agree to all of the applicable terms or do not have the
 * authority to bind the entity as an authorized representative, then do not
 * install or use this SugarCRM file.
 *
 * Copyright (C) SugarCRM Inc. All rights reserved.
 */
/**
 * EventStatusField is a field for Meetings/Calls that show the status field of the model as a badge field.
 *
 * @class View.Fields.Base.EventStatusField
 * @alias SUGAR.App.view.fields.BaseEventStatusField
 * @extends View.Fields.Base.BadgeSelectField
 */
({
    extendsFrom: 'BaseField',

    /**
     * @inheritdoc
     */
    initialize: function (options) {
        this._super('initialize', [options]);
    },

    /**
     * @inheritdoc
     *
     * Styles the badge.
     *
     * @private
     */
    _render: function () {
        this._super('_render');
        this.styleLabel();
    },

    /**
     * Sets the appropriate CSS class on the label based on the value of the
     * status.
     *
     * It is a noop when the field is in edit mode.
     *
     * @param {String} status
     */
    styleLabel: function () {
        var $label;
        $label = this.$el.children(0);

        switch (this.value) {
            case 'visa':
                $label.addClass('fa fa-cc-visa visa-icon');
                break;
            case 'amex':
                $label.addClass('fa fa-cc-amex amex-icon');
                break;
            case 'mastercard':
                $label.addClass('fa fa-cc-mastercard mastercard-icon');
                break;
            case 'discover':
                $label.addClass('fa fa-cc-discover discover-icon');
                break;
            default:
                $label.addClass('fa fa-cc-visa visa-icon');
                break;
        }
    }
})
