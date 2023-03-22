import * as Decode from 'wdk-client/Utils/Json';
import { ModelEntity, UrlModelEntity, NamedModelEntity } from 'wdk-client/Utils/WdkModel';

export const modelEntityDecoder: Decode.Decoder<ModelEntity> =
  Decode.combine(
    Decode.field('displayName', Decode.string),
    Decode.field('properties', Decode.optional(Decode.objectOf(Decode.arrayOf(Decode.string))))
  )

export const namedModelEntityDecoder: Decode.Decoder<NamedModelEntity> =
  Decode.combine(
    modelEntityDecoder,
    Decode.field('name', Decode.string)
  )

export const urlModelEntityDecoder: Decode.Decoder<UrlModelEntity> =
  Decode.combine(
    modelEntityDecoder,
    Decode.field('fullName', Decode.string),
    Decode.field('urlSegment', Decode.string)
  )