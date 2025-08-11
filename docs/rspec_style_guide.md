# RSpec コーディングスタイルガイド

このガイドラインは、チームにおけるRSpecのコーディングスタイルを統一し、可読性とメンテナンス性の高いテストコードを維持することを目的とします。

-----

## 1\. スタイリングとフォーマット

### コードのレイアウト

`let` や `before` などの定義ブロックと、`it` などの実行ブロックの間には**空行を1つ入れ**、論理的な区切りを明確にします。

```ruby
context 'when user is active' do
  let(:active) { true }

  it { is_expected.to be true }
end
```

### `context` のネスト

`context` がネストする場合、2階層目以降は `and` で始めることで、条件の組み合わせを分かりやすく表現します。

```ruby
context 'when user is admin' do
  context 'and user is deleted' do
    # ...
  end
end
```

### ハッシュ値の省略記法

ローカル変数と同じ名前のハッシュキーを渡す場合、Ruby 2.7以降の省略記法を積極的に使用します。

```ruby
# good
let(:user) { create(:user, active:) }
```

-----

## 2\. ブロックの記述順序

`describe` や `context` 内では、以下の順序でブロックを記述します。

1.  `subject`
2.  `let!`
3.  `let`
4.  `before`
5.  `it`

-----

## 3\. データセットアップ

### `let` と `before` の使い分け

  * **`let` / `let!`**: `it` ブロック内で**明示的に参照する変数**を定義するために使用します。
  * **`before`**: `it` ブロック内では参照しませんが、**テストの前提条件として必要なデータの作成**に使用します。

### `context` を活用した差分テスト

テストの前提条件に少しだけ差分がある場合は、親スコープでベースとなるオブジェクトを定義し、子の `context` で**差分となる値のみを `let` で上書き**します。

```ruby
describe '#active?' do
  subject { user.active? }

  let(:user) { create(:user, state:) }

  context 'when user is active' do
    let(:state) { :active }
    
    it { is_expected.to be true }
  end

  context 'when user is pending' do
    let(:state) { :pending }
    
    it { is_expected.to be false }
  end
end
```

### `let` の上書きに関する注意

上記の「差分テスト」パターンは推奨されますが、**`let` で定義された変数を、意図が分かりにくくなる形でまるごと上書きすることは避けます**。テストの前提条件が大きく異なる場合は、`context` を分けるか、別の `describe` を作成することを検討してください。

### `before` ブロックでのデータ作成

親子関係のあるデータを作成する場合、インスタンス変数 (`@`) を使わず、`create` の**ブロック変数**を用いて関連性を表現します。

```ruby
before do
  create(:company) do |company|
    create(:user, company:)
  end
end
```

### テストデータの更新方法

テストの前提条件としてデータを変更する場合、`update` メソッドで直接データを書き換えることは避けてください。状態が異なるデータが必要な場合は、`create` で別途作成します。

### 時刻の扱い (`travel_to`)

タイムスタンプが関わるテストでは、`created_at` などを直接上書きするのではなく、Active Supportの `travel_to` を使って時刻を固定します。

```ruby
it 'creates a report for yesterday' do
  travel_to Time.current.yesterday do
    # ... 時刻が固定された状態でのテスト処理
  end
end
```

### 自動採番カラムの扱い

データベースによって自動で採番される `id` などのカラムは、テストデータ作成時に**手動で値を指定しません**。テスト内で値が必要な場合は、作成されたオブジェクトから参照します。

```ruby
# BAD: idを直接指定している
let(:client) { create(:client, id: 123) }

# GOOD: 作成されたオブジェクトのidを参照する
let(:client) { create(:client) }

it do
  expect(subject).to eq({ id: client.id })
end
```

-----

## 4\. `expect` による検証

### マッチャーの括弧

マッチャーに引数を渡す際の括弧 `()` は、**原則として省略**します。

```ruby
expect(response).to have_http_status :ok
```

### 1 `it` あたりの `expect` 数

関連性の高い検証は `have_attributes` や `and` を使って**積極的にまとめます**。

```ruby
it 'has correct attributes' do
  expect(user).to have_attributes(
    name: 'Taro',
    email: 'taro@example.com'
  )
end
```

### `change` マッチャー

状況に応じて柔軟に使い分けます。レコード数の変化は `.by` を、属性値の変化は `.from` と `.to` を使用します。

### 配列・ハッシュのマッチャー

部分一致の `include` よりも、**完全一致の `eq` を優先**します。順序を問わない完全一致には `contain_exactly` を使用します。

### 期待値の書き方

テストの期待値を検証する際は、\*\*値を直接記述（ハードコーディング）\*\*することを基本とします。これにより、テストコードを読むだけで期待する結果が明確にわかります。`id` のような動的な値のみ、変数から参照します。

```ruby
it 'returns correct user data' do
  json = JSON.parse(response.body)
  expect(json).to eq(
    'id' => user.id,
    'name' => '山田太郎', # user.name とは書かない
    'rank' => 'gold'
  )
end
```

-----

## 5\. System Spec (Feature Spec) の書き方

### Capybaraマッチャーの活用

System Specでは、`find` などで要素を取得してから検証するのではなく、Capybaraが提供する `have_css` や `have_content` といった**専用のマッチャーを直接使います**。これらのマッチャーには、非同期処理を待つ仕組みが組み込まれています。

```ruby
# BAD: 要素を探してから検証している
node = find('.user_name')
expect(node).to have_content('山田太郎')

# GOOD: 専用マッチャーで一度に検証する
expect(page).to have_css('.user_name', text: '山田太郎')

# GOOD: `within`でスコープを絞り、可読性を上げる
within '.profile' do
  expect(page).to have_content('自己紹介文です')
end
```

-----

## 6\. モックとスタブ

  * **基本方針**: 原則としてallowを使わずに同じデータを再現できるのが望ましいが、外部依存や他のオブジェクトとの連携は、**スタブ (`allow`)** を基本とします。
  * **定義場所**: スタブの定義は **`before` ブロック内**で行います。

-----

## 7\. テストの共通化 (`shared_examples`)

  * **原則として使用しません**。テストの可読性と具体性を優先します。例外的な使用はチームで合意の上、検討します。