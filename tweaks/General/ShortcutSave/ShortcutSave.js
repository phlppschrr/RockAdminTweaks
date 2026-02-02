(function () {
  $(document).ready(function () {
    function getSaveButton() {
      var aos_saveButton = false;

      // If CKEditor is maximized (via plugin), return to normal state
      $('.cke_button__maximize.cke_button_on').trigger('click');

      if (window.frameElement && !$('body').hasClass('modal')) {
        // In iframe but not in a modal (e.g., with FEEL)
        aos_saveButton = $('.ui-dialog-buttonset button[role="button"]', window.parent.document).eq(0);
      } else {
        var selectors = [
          '.aos_hotkeySave',
          '#submit_save_unpublished',
          'form#ProcessTemplateAdd #Inputfield_submit',
          '#submit_publish',
          '#Inputfield_submit_save',
          '#submit_save',
          '#ProcessTemplateEdit #Inputfield_submit',
          '#Inputfield_submit_save_field',
          '#Inputfield_submit_save_module',
          '#submit_save_profile',
          '#save_translations',
          '#saveJumplink'
        ];

        $.each(selectors, function (i, selector) {
          var res = $(selector);
          if (res.length) {
            aos_saveButton = res;
            return false;
          }
        });

        // Modal opened, but controls have focus (outside the iframe)
        if (aos_saveButton.length === 0) {
          aos_saveButton = $('.ui-dialog-buttonset button[role="button"]').eq(0);
        }
      }

      return aos_saveButton;
    }

    function aos_triggerSave() {
      // Check for open CKE dialog (e.g., Source) and trigger the save if possible
      if ($('.cke_dialog:visible').length) {
        if ($('.cke_dialog:visible').find('.cke_dialog_ui_button_ok').length) {
          $('.cke_dialog:visible').find('.cke_dialog_ui_button_ok').first().click();
          return false;
        }
      }

      var aos_saveButton = getSaveButton();

      if (aos_saveButton.length) {
        var context = $('html'),
          $body;

        if ($('iframe.pw-modal-window', window.parent.document).length) {
          context = $('iframe.pw-modal-window', window.parent.document).contents().find('html');
        }

        $body = $('body', context);

        if ($body.hasClass('aos_saving')) {
          return false;
        }

        if (!aos_saveButton.hasClass('aos_hotkey_save_added')) {
          $(aos_saveButton.get(0).form).on('submit', function () {
            $body.addClass('aos_saving ui-state-disabled');
            aos_saveButton.addClass('ui-state-disabled');
          });

          aos_saveButton.addClass('aos_hotkey_save_added');
        }

        // IE fix for focus and click
        setTimeout(function () {
          aos_saveButton.focus().click();
        }, 100);
      }
    }

    function setupCKESave() {
      if (window.CKEDITOR) {
        CKEDITOR.on('instanceReady', function (evt) {
          evt.editor.addCommand('saveCKECommand', {
            exec: function (editor, data) {
              aos_triggerSave();
            }
          });
          evt.editor.keystrokeHandler.keystrokes[CKEDITOR.CTRL + 83 /* ctrl+s */] = 'saveCKECommand';
        });
      }
    }

    // Capture the "ctrl+s" keyboard shortcut
    $(document).on('keydown', function (e) {
      // Check specifically for 's' (83)
      var keyCode = e.keyCode || e.charCode;
      if ((e.metaKey || e.ctrlKey) && keyCode === 83) {
        aos_triggerSave();
        e.preventDefault();  // Disable browser's Save As dialog
        return false;
      }
    });

    // Handle "ctrl+s" in CKEditor
    setupCKESave();

    // Handle "ctrl+s" in CKEditor inside repeaters
    $(document).on('reloaded', '.InputfieldRepeaterItem', function () {
      setupCKESave();
    });

  });
})();
