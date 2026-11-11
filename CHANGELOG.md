## [0.2.0](https://github.com/Keimelion/Keimelion-Backoffice/compare/v0.1.0...v0.2.0) (2026-11-11)

### Features

* /reports list and moderate user reports (KEI-163) ([#75](https://github.com/Keimelion/Keimelion-Backoffice/issues/75)) ([ecbb64b](https://github.com/Keimelion/Keimelion-Backoffice/commit/ecbb64b9e7f59a136d6a081ef2af2927107356a0))
* sidebar show the deployed Backoffice and API versions (KEI-181) ([#80](https://github.com/Keimelion/Keimelion-Backoffice/issues/80)) ([c3f183e](https://github.com/Keimelion/Keimelion-Backoffice/commit/c3f183e0f71751234122daad4b57b8c5c4b136e9))

### Bug Fixes

* /users send email, username and role as operator filters ([#58](https://github.com/Keimelion/Keimelion-Backoffice/issues/58)) ([978539e](https://github.com/Keimelion/Keimelion-Backoffice/commit/978539e51a3ea117285855514dc0e8b8a822a92a)), closes [Keimelion-API#27](https://github.com/Keimelion/Keimelion-API/issues/27)

## 0.1.0 (2026-11-02)

### Features

* _auth-storage silent refresh token rotation (KEI-42) ([#8](https://github.com/Keimelion/Keimelion-Backoffice/issues/8)) ([a18a1c2](https://github.com/Keimelion/Keimelion-Backoffice/commit/a18a1c2b7b1b7395b9fca456ab517b8dc7a9aa15))
* _i18n add react-intl catalog and externalize UI strings (KEI-60) ([#13](https://github.com/Keimelion/Keimelion-Backoffice/issues/13)) ([b37b8a4](https://github.com/Keimelion/Keimelion-Backoffice/commit/b37b8a44e12398239aab53bc96a8fd7bd6b5c2a6))
* _i18n send Accept-Language + user language picker (KEI-59) ([#11](https://github.com/Keimelion/Keimelion-Backoffice/issues/11)) ([efd7110](https://github.com/Keimelion/Keimelion-Backoffice/commit/efd71103da78708f05980eda0814d10208cfd9dc))
* _notify shared notify helpers with consistent toast copy (KEI-54) ([#7](https://github.com/Keimelion/Keimelion-Backoffice/issues/7)) ([e432148](https://github.com/Keimelion/Keimelion-Backoffice/commit/e432148b24af0ca0fb2d4698fde1f809d7c34c0a))
* _slugify shared auto-slug hook across admin create forms (KEI-103) ([#26](https://github.com/Keimelion/Keimelion-Backoffice/issues/26)) ([fe098fa](https://github.com/Keimelion/Keimelion-Backoffice/commit/fe098fab2dd88942a147ed5c06f4ea7580b6fe38))
* /categories admin CRUD list + dialogs (KEI-101) ([#25](https://github.com/Keimelion/Keimelion-Backoffice/issues/25)) ([60681e1](https://github.com/Keimelion/Keimelion-Backoffice/commit/60681e1d8631a09e420db54051986c2c3b35fe3d))
* /dashboard currency selector + FX-normalized admin GET propagation (KEI-119) ([#33](https://github.com/Keimelion/Keimelion-Backoffice/issues/33)) ([e9196b5](https://github.com/Keimelion/Keimelion-Backoffice/commit/e9196b56efe8f782b5b192449bcf216e34b46a48))
* /feedback BackOffice page list + triage (KEI-122) ([#35](https://github.com/Keimelion/Keimelion-Backoffice/issues/35)) ([f31f5a1](https://github.com/Keimelion/Keimelion-Backoffice/commit/f31f5a1cd3cab6ca0e2c000067a66f78d308c2b4))
* /forgot-password add self-service password recovery flow (KEI-43) ([#2](https://github.com/Keimelion/Keimelion-Backoffice/issues/2)) ([d4adf17](https://github.com/Keimelion/Keimelion-Backoffice/commit/d4adf171b88f0db3285eac49f50ff66a5be69def))
* /items + /users display item images and user avatars (KEI-124) ([#38](https://github.com/Keimelion/Keimelion-Backoffice/issues/38)) ([4192b73](https://github.com/Keimelion/Keimelion-Backoffice/commit/4192b7340de359ba37b3ba61bef460b4546bfd88))
* /items admin CRUD with inline sources sheet (KEI-89) ([#22](https://github.com/Keimelion/Keimelion-Backoffice/issues/22)) ([4de1995](https://github.com/Keimelion/Keimelion-Backoffice/commit/4de199559fa863ee8007c53a51beff4803a8adb3))
* /items item-form categories picker (KEI-105) ([#27](https://github.com/Keimelion/Keimelion-Backoffice/issues/27)) ([2b14e73](https://github.com/Keimelion/Keimelion-Backoffice/commit/2b14e73dd749860509e6cd02eee88fbd71085ba8))
* /lists admin page with items expand (KEI-111) ([#32](https://github.com/Keimelion/Keimelion-Backoffice/issues/32)) ([b6211a1](https://github.com/Keimelion/Keimelion-Backoffice/commit/b6211a1751b30401bc52171c71c5548b276b66ab)), closes [#48](https://github.com/Keimelion/Keimelion-Backoffice/issues/48) [#49](https://github.com/Keimelion/Keimelion-Backoffice/issues/49)
* /login wire login form + auth session (KEI-41) ([#1](https://github.com/Keimelion/Keimelion-Backoffice/issues/1)) ([d689610](https://github.com/Keimelion/Keimelion-Backoffice/commit/d689610c7d4f007f9669a7aa7edd2cb6367c2c05)), closes [#ef4444](https://github.com/Keimelion/Keimelion-Backoffice/issues/ef4444) [#22c55e](https://github.com/Keimelion/Keimelion-Backoffice/issues/22c55e) [#f59e0b](https://github.com/Keimelion/Keimelion-Backoffice/issues/f59e0b) [#3b82f6](https://github.com/Keimelion/Keimelion-Backoffice/issues/3b82f6) [#f5f5f4](https://github.com/Keimelion/Keimelion-Backoffice/issues/f5f5f4)
* /occasion-types admin CRUD with translations (KEI-64) ([#15](https://github.com/Keimelion/Keimelion-Backoffice/issues/15)) ([9c9a8fa](https://github.com/Keimelion/Keimelion-Backoffice/commit/9c9a8fa6414a45fb697c935eec849428e4f02100))
* /occasion-types wire non-paginated list page (KEI-57) ([#10](https://github.com/Keimelion/Keimelion-Backoffice/issues/10)) ([5a771c3](https://github.com/Keimelion/Keimelion-Backoffice/commit/5a771c3c8e3df118efed4b58138873a3f1946ef7))
* /profile shell + change password + default currency (KEI-44, KEI-96) ([#34](https://github.com/Keimelion/Keimelion-Backoffice/issues/34)) ([91359d6](https://github.com/Keimelion/Keimelion-Backoffice/commit/91359d6b73d44624aae3aedbf92be136babcdf41))
* /reservations backoffice moderation screens + item/user reservation counters (KEI-134) ([#37](https://github.com/Keimelion/Keimelion-Backoffice/issues/37)) ([a678d1b](https://github.com/Keimelion/Keimelion-Backoffice/commit/a678d1b146976f85bf409476f18c6e0b67152f07))
* /tags admin CRUD page with pagination + search (KEI-109) ([#30](https://github.com/Keimelion/Keimelion-Backoffice/issues/30)) ([5e170c2](https://github.com/Keimelion/Keimelion-Backoffice/commit/5e170c2f2425064f620fdb51451d9d6673153cc1))
* /users add create/update/delete admin dialogs (KEI-62) ([#16](https://github.com/Keimelion/Keimelion-Backoffice/issues/16)) ([d7c7d1a](https://github.com/Keimelion/Keimelion-Backoffice/commit/d7c7d1ae9ede89bbc6b78b2b375b8a52b1a01e15))
* /users add sortable column headers (KEI-51) ([#14](https://github.com/Keimelion/Keimelion-Backoffice/issues/14)) ([d047db8](https://github.com/Keimelion/Keimelion-Backoffice/commit/d047db8634e143c375c0dd33fb362534ccc6795b))
* /users list all Keimelion accounts (KEI-40) ([#4](https://github.com/Keimelion/Keimelion-Backoffice/issues/4)) ([d029698](https://github.com/Keimelion/Keimelion-Backoffice/commit/d0296985692f6b2eaca66e7eef132f814bc20370))
* components/ui/form add shadcn Form primitive + refactor auth forms (KEI-53) ([#6](https://github.com/Keimelion/Keimelion-Backoffice/issues/6)) ([4cdd6de](https://github.com/Keimelion/Keimelion-Backoffice/commit/4cdd6defd58d128fb8368118ae83414197c86b13))
* ConfirmDialog add Dialog/Sheet/AlertDialog primitives + shared wrapper (KEI-52) ([#12](https://github.com/Keimelion/Keimelion-Backoffice/issues/12)) ([7c5d747](https://github.com/Keimelion/Keimelion-Backoffice/commit/7c5d7470b81004a608d632f5dbd2034f9df4aa9b))
* design system + dashboard shell — sidebar nav, dark mode toggle, login page ([c44735d](https://github.com/Keimelion/Keimelion-Backoffice/commit/c44735d00fe45291bc405c23dec16b3e8c00dce8)), closes [#ffb703](https://github.com/Keimelion/Keimelion-Backoffice/issues/ffb703) [#023047](https://github.com/Keimelion/Keimelion-Backoffice/issues/023047)
* shops admin CRUD with reorder mode (KEI-78) ([#21](https://github.com/Keimelion/Keimelion-Backoffice/issues/21)) ([409e258](https://github.com/Keimelion/Keimelion-Backoffice/commit/409e2588ff653ac571a5519427fab7ceb83d0262))
* Tooltip add shadcn primitive + wire IconButton (KEI-55) ([#5](https://github.com/Keimelion/Keimelion-Backoffice/issues/5)) ([e0e7f8a](https://github.com/Keimelion/Keimelion-Backoffice/commit/e0e7f8aff9a384d23e19fe9524a73ea0b7ccc0fa))

### Bug Fixes

* /categories consume per-entity translations from API (KEI-102 catch-up) ([#28](https://github.com/Keimelion/Keimelion-Backoffice/issues/28)) ([00557c1](https://github.com/Keimelion/Keimelion-Backoffice/commit/00557c10aa654d8712f8a52b4a0ee5068daa5da3))
* destructive dialog buttons no longer overflow modal (KEI-69) ([#17](https://github.com/Keimelion/Keimelion-Backoffice/issues/17)) ([99b88c9](https://github.com/Keimelion/Keimelion-Backoffice/commit/99b88c91c8d367939b1e9c28d003a373ff7ef099))
