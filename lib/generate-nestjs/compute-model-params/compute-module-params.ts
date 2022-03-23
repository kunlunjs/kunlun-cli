import type { Model, ModuleParams } from '../generator/types'

interface ComputeModuleParamsParam {
  model: Model
}

/**
 * 处理 Model 中的 field （排除、覆盖等）
 */
export const computeModuleParams = ({
  model
}: ComputeModuleParamsParam): ModuleParams => {
  return {
    model
  }
}
