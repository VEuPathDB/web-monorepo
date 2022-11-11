import { TypeOf, union } from 'io-ts';
import { ioBlastNConfig } from './blast-config-n';
import { ioBlastPConfig } from './blast-config-p';
import { ioPSIBlastConfig } from './blast-config-psi';
import { ioRPSBlastConfig } from './blast-config-rps';
import { ioRPSTBlastNConfig } from './blast-config-rpstn';
import { ioTBlastNConfig } from './blast-config-tn';
import { ioTBlastXConfig } from './blast-config-tx';
import { ioBlastXConfig } from './blast-config-x';

export const ioBlastConfig = union([
  ioBlastNConfig,
  ioBlastPConfig,
  ioBlastXConfig,
  ioPSIBlastConfig,
  ioRPSBlastConfig,
  ioRPSTBlastNConfig,
  ioTBlastNConfig,
  ioTBlastXConfig,
]);

export type IOBlastConfig = TypeOf<typeof ioBlastConfig>;
