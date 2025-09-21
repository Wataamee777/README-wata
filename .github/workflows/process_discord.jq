.[0] as $profile
| .[1] as $member
| .[2] as $guild
| $profile
+ {
  avatar: ($base + "/avatars/" + $profile.id + "/" + $profile.avatar + ".png"),
  banner: ($profile.banner | if . then $base + "/banners/" + $profile.id + "/" + . + ".png" else null end),
  banner_color: $profile.banner_color,
  accent_color: ($profile.accent_color | if . then "#" + tostring else null end),
  status: ($member.presence.status | if .=="online" then "🟢オンライン" elif .=="idle" then "🌙退席" elif .=="dnd" then "⛔取り込み" else "🔘オフライン" end),
  clan: { id: $guild.id, name: $guild.name, icon: ($guild.icon | if . then $base + "/icons/" + $guild.id + "/" + . + ".png" else null end) }
}
| del(.discriminator, .discussions, .collectibles)
