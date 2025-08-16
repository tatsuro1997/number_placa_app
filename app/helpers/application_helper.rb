module ApplicationHelper
  def flash_class(type)
    case type.to_s
    when "notice", "success"
      "bg-green-100 border border-green-400 text-green-700"
    when "alert", "error"
      "bg-red-100 border border-red-400 text-red-700"
    when "warning"
      "bg-yellow-100 border border-yellow-400 text-yellow-700"
    else
      "bg-blue-100 border border-blue-400 text-blue-700"
    end
  end

  def flash_icon(type)
    case type.to_s
    when "notice", "success"
      "✅"
    when "alert", "error"
      "❌"
    when "warning"
      "⚠️"
    else
      "ℹ️"
    end
  end
end
