module.exports = {
    "Just UI layer (admin, plugins)": {
        "Login to admin interface": [
            "func ui/admin_login: open admin page -> enter email in login/email input -> enter password in password input -> go inside admin"
        ],
        "User Activation": [
            "func ui/activation : user wants register -> see activation message (from plugin/without plugin) -> see activation page"
        ],
        "Can change appearance": [
            "func ui/change_appearance_hide_blocks: hide objects or query string depend on plugin settings",
            "func ui/change_appearance_hide_views : hide json view and other views depend on plugin settings",
            "func ui/change_appearance_add_views  : add new views and make they default depends on plugin settings",
            "func ui/change_appearance_default_queries: check that plugins can change default queries and add new queries"
        ],
        "Shows Users and other objects with counts. Counts should update immediately after change.": [
            "func ui/objects: show all objects with counts. emulate change, check new count"
        ],
        "Should show editable query string.": [
            "func ui/query_string: check that query string executing on enter and result is in the screen. check that query string changed after click on object."
        ]
    },
    "Just admin controllers": {
        "Load and update plugins list": [
            "unit ctrl/plugins_workflow: load plugins list, check access to plugins, add plugin, check that new plugin is in the list"
        ]
    },
    "Just JS API layer ": {
        "register/activation/login/logout should work and should have mongo native interface": [
            "func js/register_login_logout : register new user, activate, login, logout",
            "func js/register_login_errors : place wrong data in register/login form, check error message"
        ],
        "insert/find/update/remove should work": [
            "func js/crud : create object with new type, try to find, update, remove"
        ],
        "save/snapshots/revert should work": [
            "func js/save_snapshot_revert : make save/snapshot/revert"
        ]
    },
    "Just HTTP API layer ": {
        "Component: Auth": {
            "Attribute: Functional": {
                "user should be able to register": [
                    "func just-http-layer/_tests/auth.functional.register: register, verify email, login, logout"
                ],
                "user should be able to reset password": [
                    "func just-http-layer/_tests/auth.functional.reset_password: request reset password, add new password, login"
                ],
                "user should be able to update user data": [
                    "func just-http-layer/_tests/auth.functional.update_user: login with an existing user, update user data"
                ],
                "user should be able to delete another user": [
                    'func just-http-layer/_tests/auth.functional.delete_user: register new user, login with an existing user, ' +
                    'return success on deleting new user, return error when trying to login with removed user'
                ],
                "user should be able to change password": [
                    "func just-http-layer/_tests/auth.functional.change_password: login with an existing user, change password, logout, " +
                    "return error on trying to login with old password, return success on trying to login with new password"
                ],
                "user should be able to retrieve other users": [
                    "func just-http-layer/_tests/auth.functional.get_users: login with an admin user, get users, " +
                    "get particular user"
                ]
            },
            "Attribute: Secure": {
                "user should not be able to register with already existing password": [
                    "func just-http-layer/_tests/auth.secure.register_wrong_credentials: register with wrong email, register with existing email, register with empty password"
                ],
                "user should not be able verify wrong email": [
                    "func just-http-layer/_tests/auth.secure.verify_wrong_email: register, verify wrong email"
                ],
                "when changing user data": [
                    "unit just-http-layer/_tests/auth.secure.change_password: return error on wrong old password, " +
                    "return error if an old password equals to a new password, return error on wrong new password," +
                    "return error for unauthorised user"
                ],
                "user should not be able to use the same link several times to reset password": [
                    "func just-http-layer/_tests/auth.secure.reset_password_link: request reset password, reset password, return error on reset password with already used link"
                ],
                "user could not register with admin rights": [
                    "func just-http-layer/_tests/auth.secure.register_user_admin: return error on trying register with admin rights"
                ]
            },
            "Attribute: Configurable": {
                "programmer should be able to customise reset password email": [
                    "func just-http-layer/_tests/auth.configurable.reset_password_email: add plugin with reset password email template, " +
                    "get mail options suited to plugin on request to reset password"
                ],
                "programmer should be able to customise register email": [
                    "func just-http-layer/_tests/auth.configurable.register_email: add plugin with register email template, "
                        + "get mail options suited to plugin on register"
                ]
            }
        },

        "Component: Plugins": {
            "Attribute: Functional": {
                "admin user should be able to manage plugins": [
                    "func just-http-layer/_tests/plugins.functional.manage_plugins: add plugin, return plugin list with newly added plugin"
                        + "save plugin with other parameter, check that plugin updated, delete plugin, return plugin list without newly added plugin",
                    "func just-http-layer/_tests/plugins.functional.test_plugin_flag: add plugin that change test flag to 1, check that test flag is 1, "
                        + "add plugin that change test flag to 0, check that test flag is 1, change last plugin order to 0, check check that test flag is 1 again"
                ]
            },
            "Attribute: Secure": {
                "common user should not be able to manage plugins": [
                    "func just-http-layer/_tests/plugins.secure.plugin_manage_common_user: return error on add plugin, return error on save plugin, return error on get plugin, return error on delete plugin"
                ],
                "unauthorized requests should be denied": [
                    "unit just-http-layer/_tests/plugins.secure.plugin_unauthorized: return error on get, return error on save, return error on delete"
                ]
            }
        },

        "Component: Snapshots": {
            "Attribute: Functional": {
                "save function should work correctly": [
                    "func just-http-layer/_tests/snapshots.functional.save_with_snapshot: save object, update object, get snapshot and check fields",
                    "func just-http-layer/_tests/snapshots.functional.save_with_excluded_fields: save object with excluded fields, get snapshot without excluded fields",
                    "unit just-http-layer/_tests/snapshots.functional.get_snapshots: prepare: save object, prepare: update object several times, "
                        + "get snapshots, get snapshots with additional params"
                ]
            },
            "Attribute: Foolproof": {
                "save function should work correctly": [
                    "func just-http-layer/_tests/snapshots.foolproof.save_without_changes: save object, save the same object, return only one snapshot"
                ]
            }
        },

        "Component: Content": {
            "Attribute: Functional": {
                "user should be able to get script files": [
                    "unit just-http-layer/_tests/content.functional.get_script_files: get mongoSitesApi.js, get mongoSitesApi.angular.js"
                ]
            }
        }
    },
    "Just server implementation layer": {
    },
    "Just config layer": {
        "Can set admin account email from env variables": [
            "func deploy/admin: set usual user as admin, check that provided user is admin"
        ]
    }
};
