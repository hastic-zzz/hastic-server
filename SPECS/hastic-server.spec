%define name hastic-server
%define version 0.2.6_alpha_%{echo $RPM_RELEASE}
%define release 0
%define buildroot %(mktemp -ud %{_tmppath}/server/%{name}-%{version}-%{release}-XXXXXX)

Name: %{name}
Version: %{version}
Release: %{release}
Summary: hastic-server

Group: Installation Script
License: Apache-2.0
URL: hastic.io
BuildRoot: %{buildroot}
Requires: nodejs >= 6, python3
BuildRequires: nodejs
AutoReqProv: no

%description
REST server for managing data for analytics

%prep
mkdir -p %{buildroot}
cp -r ../server %{buildroot}
cp -r ../analytics %{buildroot}

%build
pushd %{buildroot}/analytics

save=$RPM_BUILD_ROOT
unset RPM_BUILD_ROOT

pip3.6 -q install -U pip setuptools pyinstaller
pip3.6 -q install -r requirements.txt
pyinstaller --additional-hooks-dir=pyinstaller_hooks --paths=analytics/ bin/server

export RPM_BUILD_ROOT=$save
popd

pushd %{buildroot}/server
npm prune --production
npm rebuild
popd

#%pre
#getent group hastic-server >/dev/null || groupadd -r hastic-server
#getent passwd hastic-server >/dev/null || useradd -r -g hastic-server -G hastic-server -d / -s /sbin/nologin -c "hastic-server" hastic-server

%install
mkdir -p %{buildroot}/usr/lib/hastic-server
cp -r ./ %{buildroot}/usr/lib/hastic-server

#%post
#systemctl enable /usr/lib/hastic-server/hastic-server.service
ln -s /bin/hastic-server/data /etc/hastic-server/data
ln -s /bin/hastic-server/config /etc/hastic-server/config

%clean
rm -rf %{buildroot}

%files
%defattr(644, hastic-server, hastic-server, 755)
/bin/hastic-server
/etc/hastic-server
