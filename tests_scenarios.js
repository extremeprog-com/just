module.exports = {
    "MSA UI layer (admin, plugins)": {
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
    "MSA admin controllers": {
        "Load and update plugins list": [
            "unit ctrl/plugins_workflow: load plugins list, check access to plugins, add plugin, check that new plugin is in the list"
        ]
    },
    "MSA JS API layer ": {
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
    "MSA HTTP API layer ": {
        "Component: Auth": {
            "Attribute: Functional": {
                "user should be able to register": [
                    "func api/auth.functional.register: register, verify email, login, logout"
                ],
                "user should be able to reset password": [
                    "func api/auth.functional.reset_password: request reset password, add new password, login"
                ],
                "user should be able to update user data": [
                    "func api/auth.functional.update_user: login with an existing user, update user data"
                ],
                "user should be able to delete another user": [
                    'func api/auth.functional.delete_user: register new user, login with an existing user, ' +
                    'return success on deleting new user, return error when trying to login with removed user'
                ],
                "user should be able to change password": [
                    "func api/auth.functional.change_password: login with an existing user, change password, logout, " +
                    "return error on trying to login with old password, return success on trying to login with new password"
                ]
            },
            "Attribute: Secure": {
                "user should not be able to register with already existing password": [
                    "func api/auth.secure.register_wrong_credentials: register with wrong email, register with existing email, register with empty password"
                ],
                "user should not be able verify wrong email": [
                    "func api/auth.secure.verify_wrong_email: register, verify wrong email"
                ],
                "when changing user data": [
                    "unit api/auth.secure.change_password: return error on wrong old password, " +
                    "return error if an old password equals to a new password, return error on wrong new password," +
                    "return error for unauthorised user"
                ]
            }
        },

        "register/activation/login/logout should be foolproof": [
            "func api/rubbish : try to send some bad values to register/login/update user api (too long, empty, wrong format)"
        ],
        "save/snapshots/revert should work": [
            "func js/save_snapshot_revert : make save/snapshot/revert"
        ],
        "should not view restricted objects": [
            "func api/restrict : add user, add plugin, check that user can't get restricted objects"
        ]
    },
    "MSA server implementation layer": {
    },
    "MSA config layer": {
        "Can set admin account email from env variables": [
            "func deploy/admin: set usual user as admin, check that provided user is admin"
        ]
    }
};